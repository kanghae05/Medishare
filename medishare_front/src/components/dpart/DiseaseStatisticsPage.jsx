import { useCallback, useEffect, useMemo, useState } from "react";
import { getDiseaseStatistics, getTopDiseaseStatistics } from "../../api/statisticsApi";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import { extractErrorMessage } from "./dpartUtils";

const mockDiseases = [
  { diseaseId: 1, diseaseCode: "I63", diseaseName: "Cerebral infarction", interpretationCount: 18, consultationCount: 9, completedConsultationCount: 6, ratio: 32.1 },
  { diseaseId: 2, diseaseCode: "J18", diseaseName: "Pneumonia", interpretationCount: 14, consultationCount: 7, completedConsultationCount: 5, ratio: 25.0 },
  { diseaseId: 3, diseaseCode: "S06", diseaseName: "Intracranial injury", interpretationCount: 10, consultationCount: 4, completedConsultationCount: 3, ratio: 17.9 },
  { diseaseId: 4, diseaseCode: "C34", diseaseName: "Lung malignancy", interpretationCount: 8, consultationCount: 3, completedConsultationCount: 2, ratio: 14.3 },
  { diseaseId: 5, diseaseCode: "K80", diseaseName: "Cholelithiasis", interpretationCount: 6, consultationCount: 2, completedConsultationCount: 1, ratio: 10.7 },
];

function DiseaseStatisticsPage() {
  const [rows, setRows] = useState([]);
  const [topRows, setTopRows] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { startDate: startDate || undefined, endDate: endDate || undefined };
      const [allResponse, topResponse] = await Promise.all([
        getDiseaseStatistics(params),
        getTopDiseaseStatistics(5),
      ]);
      setRows(allResponse.data || []);
      setTopRows(topResponse.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, "질환별 통계를 불러오지 못했습니다."));
    } finally {
      setLoading(false);
    }
  }, [endDate, startDate]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const displayRows = useMemo(() => {
    if (rows.length > 0) return rows;
    return useMock ? mockDiseases : [];
  }, [rows, useMock]);

  const displayTopRows = topRows.length > 0 ? topRows : displayRows.slice(0, 5);
  const totalInterpretations = displayRows.reduce((sum, row) => sum + (row.interpretationCount || 0), 0);

  return (
    <section className="dpart-page">
      <div className="dpart-page-head">
        <div>
          <h1>질환별 판독 통계</h1>
          <p>판독과 협진 데이터가 연결되면 실제 질환별 집계가 표시됩니다.</p>
        </div>
      </div>

      <div className="dpart-filter-band">
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <span>~</span>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <label className="dpart-toggle">
          <input type="checkbox" checked={useMock} onChange={(e) => setUseMock(e.target.checked)} />
          개발용 예시 데이터
        </label>
      </div>

      {error && <div className="dpart-alert error">{error}</div>}
      {loading ? (
        <LoadingState />
      ) : displayRows.length === 0 ? (
        <EmptyState message="질환/판독 연동 데이터가 아직 없습니다." />
      ) : (
        <>
          <div className="dpart-panel">
            <h2>질환별 판독 건수</h2>
            <div className="dpart-bars">
              {displayRows.map((row) => {
                const width = totalInterpretations
                  ? Math.round(((row.interpretationCount || 0) / totalInterpretations) * 100)
                  : 0;
                return (
                  <div className="dpart-bar-row" key={row.diseaseCode || row.diseaseId}>
                    <span>{row.diseaseCode}</span>
                    <div className="dpart-bar-track">
                      <div className="dpart-bar-fill tone-blue" style={{ width: `${width}%` }} />
                    </div>
                    <strong>{row.interpretationCount}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dpart-panel">
            <h2>TOP 5</h2>
            <div className="dpart-table-wrap flat">
              <table className="dpart-table">
                <thead>
                  <tr>
                    <th>질환 코드</th>
                    <th>질환명</th>
                    <th>판독</th>
                    <th>협진</th>
                    <th>완료</th>
                    <th>비율</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTopRows.map((row) => (
                    <tr key={row.diseaseCode || row.diseaseId}>
                      <td>{row.diseaseCode}</td>
                      <td>{row.diseaseName}</td>
                      <td>{row.interpretationCount}</td>
                      <td>{row.consultationCount}</td>
                      <td>{row.completedConsultationCount}</td>
                      <td>{Number(row.ratio || 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default DiseaseStatisticsPage;
