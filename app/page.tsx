"use client";

import { useMemo, useState } from "react";

const courses = {
  minecraft: { name: "Minecraft 麥塊程式班教育版", lessons: 15, device: "筆電" },
  roblox: { name: "Roblox AI 遊戲設計班", lessons: 15, device: "筆電" },
  scratch: { name: "Scratch", lessons: 15, device: "筆電" },
  python: { name: "Python", lessons: 15, device: "筆電" },
  albert: { name: "頑皮艾伯特不在家", lessons: 35, device: "平板或筆電" },
} as const;

type CourseKey = keyof typeof courses;
const money = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });
const numberValue = (value: string) => Number(value || 0);

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

export default function Home() {
  const [courseKey, setCourseKey] = useState<CourseKey | "">("");
  const [tuition, setTuition] = useState("");
  const [students, setStudents] = useState("");
  const [secondCourseKey, setSecondCourseKey] = useState<CourseKey | "none" | "">("");
  const [secondTuition, setSecondTuition] = useState("");
  const [secondStudents, setSecondStudents] = useState("");
  const [shareRate, setShareRate] = useState("");
  const [trialSeats, setTrialSeats] = useState("");
  const [ownedDevices, setOwnedDevices] = useState("");
  const [allInDevicePrice, setAllInDevicePrice] = useState("");
  const [showResult, setShowResult] = useState(false);

  const result = useMemo(() => {
    const course = courseKey ? courses[courseKey] : null;
    const secondCourse = secondCourseKey && secondCourseKey !== "none" ? courses[secondCourseKey] : null;
    const firstCount = numberValue(students);
    const secondCount = secondCourse ? numberValue(secondStudents) : 0;
    const firstTuition = numberValue(tuition);
    const secondCourseTuition = secondCourse ? numberValue(secondTuition) : 0;
    const rate = numberValue(shareRate) / 100;
    const monthlyShare = course
      ? firstCount * (firstTuition / course.lessons) * rate * 4
        + (secondCourse ? secondCount * (secondCourseTuition / secondCourse.lessons) * rate * 4 : 0)
      : 0;
    const laptopClassSize = course
      ? Math.max(course.device === "筆電" ? firstCount : 0, secondCourse?.device === "筆電" ? secondCount : 0)
      : 0;
    const noLaptop = Boolean(course) && laptopClassSize === 0;
    const seats = numberValue(trialSeats);
    const recommendedDevicePool = laptopClassSize ? laptopClassSize + seats + 1 : 0;
    const requiredDevices = laptopClassSize ? Math.max(0, recommendedDevicePool - numberValue(ownedDevices)) : 0;
    const equipmentTotal = requiredDevices * numberValue(allInDevicePrice);
    const currentTrialCapacity = laptopClassSize
      ? Math.max(0, numberValue(ownedDevices) + requiredDevices - laptopClassSize - 1)
      : 0;
    const basicReady = Boolean(course)
      && firstCount >= 1 && firstTuition > 0 && Boolean(secondCourseKey)
      && rate > 0 && rate <= 1
      && (!secondCourse || (secondCount >= 1 && secondCourseTuition > 0));
    const equipmentReady = noLaptop || (
      ownedDevices !== "" && trialSeats !== ""
      && (requiredDevices === 0 || numberValue(allInDevicePrice) > 0)
    );
    return {
      course, secondCourse, firstCount, secondCount, monthlyShare,
      quarterlyShare: monthlyShare * 3, annualShare: monthlyShare * 12,
      noLaptop, recommendedDevicePool, requiredDevices, equipmentTotal,
      downPayment: equipmentTotal * 0.3,
      payoffMonths: equipmentTotal && monthlyShare ? Math.ceil(equipmentTotal * 0.7 / monthlyShare) : 0,
      cashBreakEvenMonths: equipmentTotal && monthlyShare ? Math.ceil(equipmentTotal / monthlyShare) : 0,
      currentTrialCapacity, ready: basicReady && equipmentReady,
    };
  }, [courseKey, tuition, students, secondCourseKey, secondTuition, secondStudents, shareRate, trialSeats, ownedDevices, allInDevicePrice]);

  const change = (setter: (value: string) => void, value: string) => {
    setter(value);
    setShowResult(false);
  };

  return (
    <main>
      <header className="topbar">
        <div className="brand"><img src="/logo-full.png" alt="橘子蘋果程式學苑" /></div>
        <div className="version">安親班合作收益試算器 · 2026</div>
      </header>
      <section className="intro">
        <p className="eyebrow">合作評估工具</p>
        <h1>把主任提出的條件，<br />立即換成看得懂的收益。</h1>
        <p>依現場洽談條件逐項輸入，完成後再呈現完整試算結果。</p>
      </section>

      <section className="calculator">
        <aside className="inputs">
          <div className="section-title"><span>01</span><h2>輸入合作條件</h2></div>
          <Field label="第一門課程">
            <select value={courseKey} onChange={(e) => { setCourseKey(e.target.value as CourseKey | ""); setShowResult(false); }}>
              <option value="">請選擇第一門課程</option>
              {Object.entries(courses).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="第一門課程每位學生實收金額">
            <div className="money-input"><span>NT$</span><input type="number" min="0" step="100" value={tuition} placeholder="請輸入本次洽談金額" onChange={(e) => change(setTuition, e.target.value)} /></div>
          </Field>
          <div className="two-col">
            <Field label="每班學生數" hint="新時段4人可啟動">
              <input type="number" min="1" max="40" value={students} placeholder="請輸入人數" onChange={(e) => change(setStudents, e.target.value)} />
            </Field>
            <Field label="每週上課頻率" hint="合作班固定每週一堂"><input value="每週 1 堂" disabled /></Field>
          </div>

          <div className="subhead">第二門課程（選填）</div>
          <Field label="是否加入第二門課">
            <select value={secondCourseKey} onChange={(e) => { setSecondCourseKey(e.target.value as CourseKey | "none" | ""); setShowResult(false); }}>
              <option value="">請選擇是否加入第二門課</option>
              <option value="none">不加入第二門課</option>
              {Object.entries(courses).filter(([key]) => key !== courseKey).map(([key, item]) => <option key={key} value={key}>{item.name}</option>)}
            </select>
          </Field>
          {result.secondCourse && <>
            <Field label="第二門課學生數" hint="與第一門課安排不同時段，共用同一批設備">
              <input type="number" min="1" max="40" value={secondStudents} placeholder="請輸入人數" onChange={(e) => change(setSecondStudents, e.target.value)} />
            </Field>
            <Field label="第二門課程每位學生實收金額">
              <div className="money-input"><span>NT$</span><input type="number" min="0" step="100" value={secondTuition} placeholder="請輸入本次洽談金額" onChange={(e) => change(setSecondTuition, e.target.value)} /></div>
            </Field>
          </>}
          <Field label="中心分潤比例" hint="依本次合作條件輸入，不預設比例">
            <div className="money-input"><span>%</span><input type="number" min="0" max="100" step="0.5" value={shareRate} placeholder="請輸入本次洽談比例" onChange={(e) => change(setShareRate, e.target.value)} /></div>
          </Field>

          <div className="subhead">設備條件</div>
          {result.noLaptop ? <div className="notice">目前選擇的課程可使用平板或筆電；中心已有合格筆電時可直接沿用，本版不另計設備採購。</div> : <>
            <Field label="中心既有合格筆電"><input type="number" min="0" max="100" value={ownedDevices} placeholder="沒有則輸入 0" onChange={(e) => change(setOwnedDevices, e.target.value)} /></Field>
            <Field label="希望同堂保留的試聽席位" hint="主任自行選擇；2席為建議情境，另保留1台純備用機">
              <select value={trialSeats} onChange={(e) => change(setTrialSeats, e.target.value)}><option value="">請選擇試聽席位</option><option value="0">0 席｜精簡型</option><option value="1">1 席</option><option value="2">2 席｜平衡型（建議）</option><option value="3">3 席｜招生型</option></select>
            </Field>
            <Field label="每台完整交付價" hint={result.requiredDevices === 0 ? "目前不需新增設備，可留白或填 0" : "依當日有效報價，須包含檢測、設定與兩年維護"}>
              <div className="money-input"><span>NT$</span><input type="number" min="0" step="500" value={allInDevicePrice} placeholder={result.requiredDevices === 0 ? "可留白" : "請輸入當日有效報價"} onChange={(e) => change(setAllInDevicePrice, e.target.value)} /></div>
            </Field>
          </>}
          <button className="calculate-button" type="button" disabled={!result.ready} onClick={() => setShowResult(true)}>完成試算</button>
          <p className="invalid-hint">{result.ready ? "條件已完成，可以產生試算結果。" : "請依序完成所有合作條件。"}</p>
        </aside>

        <section className="results" aria-live="polite">
          <div className="section-title light"><span>02</span><h2>主任專屬收益預估</h2></div>
          {!showResult ? <div className="waiting"><strong>完成條件後，再揭曉試算結果</strong><span>業務可邊談邊確認課程、人數、分潤與設備，最後一次呈現完整收益與回本時間。</span></div> : <>
            <div className="headline-result"><p>一年預估增加</p><strong>NT$ {money.format(result.annualShare)}</strong><span>{result.secondCourse ? `兩門課共 ${result.firstCount + result.secondCount} 位學生` : `${result.firstCount} 位學生`} · 固定每週一堂</span></div>
            <div className="periods"><div><span>每月預估</span><b>NT$ {money.format(result.monthlyShare)}</b></div><div><span>一季預估</span><b>NT$ {money.format(result.quarterlyShare)}</b></div></div>
            <div className="equipment-summary">
              <div className="summary-top"><h3>設備與回本</h3><span>{result.noLaptop ? "平板或既有筆電皆可" : `建議共 ${result.recommendedDevicePool} 台｜需新增 ${result.requiredDevices} 台`}</span></div>
              {result.equipmentTotal === 0 ? <p className="zero">無新增筆電投入，中心可直接取得每月分潤。</p> : <div className="equipment-grid"><div><span>設備完整投入</span><b>NT$ {money.format(result.equipmentTotal)}</b></div><div><span>30% 頭期</span><b>NT$ {money.format(result.downPayment)}</b></div><div><span>設備預估清償</span><b>第 {result.payoffMonths} 個月</b></div><div><span>累積現金回本</span><b>第 {result.cashBreakEvenMonths} 個月</b></div></div>}
            </div>
            <div className="statement"><span>試算摘要</span><p>以目前條件，{result.secondCourse ? `${result.course?.name}與${result.secondCourse.name}安排不同時段，` : ""}中心一季預估取得 <b>NT$ {money.format(result.quarterlyShare)}</b>、一年約 <b>NT$ {money.format(result.annualShare)}</b> 分潤。{result.equipmentTotal > 0 ? `設備依較大班級共用，當堂可安排 ${result.currentTrialCapacity} 位試聽。設備預估於第 ${result.payoffMonths} 個月清償。` : "目前不需新增設備投入。"}</p></div>
          </>}
        </section>
      </section>
      <footer><p>本工具為合作評估情境，實際金額依學生當月消化堂數、有效設備報價與正式合約為準。</p><p>課程實收金額與合作分潤比例，以現場輸入及正式合約為準。</p></footer>
    </main>
  );
}
