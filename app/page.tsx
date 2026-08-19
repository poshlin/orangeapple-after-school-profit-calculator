"use client";

import { useMemo, useState } from "react";

const courses = {
  minecraft: { name: "Minecraft 麥塊程式班教育版", tuition: 17800, lessons: 15, device: "筆電" },
  roblox: { name: "Roblox AI 遊戲設計班", tuition: 17800, lessons: 15, device: "筆電" },
  scratch: { name: "Scratch 實戰班（SB）", tuition: 17800, lessons: 15, device: "筆電" },
  python: { name: "Python 程式開發班（PYB）", tuition: 19400, lessons: 15, device: "筆電" },
  albert: { name: "頑皮艾伯特不在家", tuition: 18300, lessons: 35, device: "平板" },
} as const;

type CourseKey = keyof typeof courses;
const money = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function Home() {
  const [courseKey, setCourseKey] = useState<CourseKey>("minecraft");
  const [students, setStudents] = useState(6);
  const [secondCourseKey, setSecondCourseKey] = useState<CourseKey | "none">("none");
  const [secondStudents, setSecondStudents] = useState(4);
  const [ownedDevices, setOwnedDevices] = useState(0);
  const [allInDevicePrice, setAllInDevicePrice] = useState(13000);

  const result = useMemo(() => {
    const course = courses[courseKey];
    const secondCourse = secondCourseKey === "none" ? null : courses[secondCourseKey];
    const firstCount = clamp(students, 1, 40);
    const secondCount = secondCourse ? clamp(secondStudents, 1, 40) : 0;
    const totalStudents = firstCount + secondCount;
    const lessonsPerMonth = 4;
    const centerPerLesson = course.tuition / course.lessons * 0.3;
    const secondCenterPerLesson = secondCourse ? secondCourse.tuition / secondCourse.lessons * 0.3 : 0;
    const firstMonthlyShare = centerPerLesson * lessonsPerMonth * firstCount;
    const secondMonthlyShare = secondCenterPerLesson * lessonsPerMonth * secondCount;
    const monthlyShare = firstMonthlyShare + secondMonthlyShare;
    const quarterlyShare = monthlyShare * 3;
    const annualShare = monthlyShare * 12;
    const laptopClassSizes = [course.device === "筆電" ? firstCount : 0, secondCourse?.device === "筆電" ? secondCount : 0];
    const largestLaptopClass = Math.max(...laptopClassSizes);
    const requiredDevices = largestLaptopClass === 0 ? 0 : Math.max(0, largestLaptopClass + 1 - clamp(ownedDevices, 0, 100));
    const equipmentTotal = requiredDevices * clamp(allInDevicePrice, 0, 100000);
    const downPayment = equipmentTotal * 0.3;
    const balance = equipmentTotal - downPayment;
    const payoffMonths = balance > 0 && monthlyShare > 0 ? Math.ceil(balance / monthlyShare) : 0;
    const cashBreakEvenMonths = equipmentTotal > 0 && monthlyShare > 0 ? Math.ceil(equipmentTotal / monthlyShare) : 0;
    return { course, secondCourse, firstCount, secondCount, totalStudents, lessonsPerMonth, firstMonthlyShare, secondMonthlyShare, monthlyShare, quarterlyShare, annualShare, requiredDevices, equipmentTotal, downPayment, balance, payoffMonths, cashBreakEvenMonths };
  }, [courseKey, students, secondCourseKey, secondStudents, ownedDevices, allInDevicePrice]);

  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brand-mark">〈●〉</span><strong>橘子蘋果</strong><span>程式學苑</span></div>
        <div className="version">安親班合作收益試算器 · 2026</div>
      </header>

      <section className="intro">
        <p className="eyebrow">合作評估工具</p>
        <h1>把主任提出的條件，<br />立即換成看得懂的收益。</h1>
        <p>價格、堂數與30%分潤由系統自動帶入；業務只需輸入合作條件。</p>
      </section>

      <section className="calculator">
        <aside className="inputs">
          <div className="section-title"><span>01</span><h2>輸入合作條件</h2></div>
          <Field label="第一門課程">
            <select value={courseKey} onChange={(e) => setCourseKey(e.target.value as CourseKey)}>
              {Object.entries(courses).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
            </select>
          </Field>
          <div className="two-col">
            <Field label="每班學生數" hint="新時段4人可啟動">
              <input type="number" min="1" max="40" value={students} onChange={(e) => setStudents(Number(e.target.value))} />
            </Field>
            <Field label="每週上課頻率" hint="合作班固定每週一堂">
              <input value="每週 1 堂" disabled />
            </Field>
          </div>

          <div className="subhead">第二門課程（選填）</div>
          <Field label="是否加入第二門課">
            <select value={secondCourseKey} onChange={(e) => setSecondCourseKey(e.target.value as CourseKey | "none")}>
              <option value="none">不加入第二門課</option>
              {Object.entries(courses).filter(([key]) => key !== courseKey).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
            </select>
          </Field>
          {secondCourseKey !== "none" && <Field label="第二門課學生數" hint="與第一門課安排不同時段，共用同一批設備">
            <input type="number" min="1" max="40" value={secondStudents} onChange={(e) => setSecondStudents(Number(e.target.value))} />
          </Field>}

          <div className="subhead">設備條件</div>
          {result.requiredDevices === 0 && result.course.device === "平板" && result.secondCourse?.device !== "筆電" ? (
            <div className="notice">此課程使用平板；本版不計入筆電採購與分期。</div>
          ) : <>
            <Field label="中心既有合格筆電">
              <input type="number" min="0" max="100" value={ownedDevices} onChange={(e) => setOwnedDevices(Number(e.target.value))} />
            </Field>
            <Field label="每台完整交付價" hint="依當日有效報價，須包含檢測、設定與兩年維護">
              <div className="money-input"><span>NT$</span><input type="number" min="0" step="500" value={allInDevicePrice} onChange={(e) => setAllInDevicePrice(Number(e.target.value))} /></div>
            </Field>
          </>}
        </aside>

        <section className="results" aria-live="polite">
          <div className="section-title light"><span>02</span><h2>主任專屬收益預估</h2></div>
          <div className="headline-result">
            <p>一年預估增加</p>
            <strong>NT$ {money.format(result.annualShare)}</strong>
            <span>{result.secondCourse ? `兩門課共 ${result.totalStudents} 位學生` : `${result.firstCount} 位學生`} · 固定每週一堂</span>
          </div>
          <div className="periods">
            <div><span>每月預估</span><b>NT$ {money.format(result.monthlyShare)}</b></div>
            <div><span>一季預估</span><b>NT$ {money.format(result.quarterlyShare)}</b></div>
          </div>

          <div className="equipment-summary">
            <div className="summary-top"><h3>設備與回本</h3><span>{result.course.device === "平板" ? "平板課程" : `需新增 ${result.requiredDevices} 台（含1台備機）`}</span></div>
            {result.equipmentTotal === 0 ? (
              <p className="zero">無新增筆電投入，中心可直接取得每月分潤。</p>
            ) : <>
              <div className="equipment-grid">
                <div><span>設備完整投入</span><b>NT$ {money.format(result.equipmentTotal)}</b></div>
                <div><span>30% 頭期</span><b>NT$ {money.format(result.downPayment)}</b></div>
                <div><span>設備預估清償</span><b>第 {result.payoffMonths} 個月</b></div>
                <div><span>累積現金回本</span><b>第 {result.cashBreakEvenMonths} 個月</b></div>
              </div>
              <div className="timeline"><span style={{ width: `${Math.min(100, 100 / Math.max(1, result.cashBreakEvenMonths)) * Math.min(12, result.cashBreakEvenMonths)}%` }} /></div>
            </>}
          </div>

          <div className="statement">
            <span>試算摘要</span>
            <p>以目前條件，{result.secondCourse ? `${result.course.name}與${result.secondCourse.name}安排不同時段，` : ""}中心一季預估取得 <b>NT$ {money.format(result.quarterlyShare)}</b>、一年約 <b>NT$ {money.format(result.annualShare)}</b> 分潤。{result.equipmentTotal > 0 ? `筆電依較大班級共用，設備預估於第 ${result.payoffMonths} 個月清償，第 ${result.cashBreakEvenMonths} 個月達成累積現金回本。` : "目前不需新增筆電投入。"}</p>
          </div>
        </section>
      </section>

      <footer>
        <p>本工具為合作評估情境，實際金額依學生當月消化堂數、有效設備報價與正式合約為準。</p>
        <p>課程實收包含學費與教材，中心分潤按家長實收30%計算。</p>
      </footer>
    </main>
  );
}
