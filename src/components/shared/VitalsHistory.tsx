import { classifyBloodPressure, classifyHeartRate, classifyRespiratoryRate, classifySpo2, classifyTemperature } from '../../store/vitals'
import type { VitalsReading } from '../../data/patients'
import { Modal } from './Modal'

type VitalsHistoryProps = {
  readings: VitalsReading[]
  patientName: string
  onClose(): void
}

function pill(level: 'normal' | 'watch' | 'alert') {
  return `pill-${level}`
}

export default function VitalsHistory({ readings, patientName, onClose }: VitalsHistoryProps) {
  const ordered = [...readings].reverse()

  return (
    <Modal
      eyebrow="Sinais vitais"
      title="Histórico de leituras"
      subtitle={`${patientName} · ${ordered.length} ${ordered.length === 1 ? 'leitura' : 'leituras'}`}
      cardClassName="history-modal"
      onClose={onClose}
    >
      <div className="history-list">
          {ordered.map((reading, index) => {
            const spo2 = classifySpo2(reading.spo2)
            return (
              <article key={`${reading.recordedAt}-${index}`} className={index === 0 ? 'is-latest' : undefined}>
                <header>
                  <div>
                    <strong>{reading.recordedAt}</strong>
                    {index === 0 && <span className="history-latest-tag">Mais recente</span>}
                  </div>
                  <span className={pill(spo2.level)}>SpO₂ {spo2.label}</span>
                </header>
                <dl>
                  <div>
                    <dt>Pressão arterial</dt>
                    <dd>
                      {reading.bloodPressure} mmHg
                      <em className={`is-${classifyBloodPressure(reading.bloodPressure).level}`}>
                        {classifyBloodPressure(reading.bloodPressure).label}
                      </em>
                    </dd>
                  </div>
                  <div>
                    <dt>Freq. cardíaca</dt>
                    <dd>
                      {reading.heartRate} bpm
                      <em className={`is-${classifyHeartRate(reading.heartRate).level}`}>
                        {classifyHeartRate(reading.heartRate).label}
                      </em>
                    </dd>
                  </div>
                  <div>
                    <dt>Freq. respiratória</dt>
                    <dd>
                      {reading.respiratoryRate} irpm
                      <em className={`is-${classifyRespiratoryRate(reading.respiratoryRate).level}`}>
                        {classifyRespiratoryRate(reading.respiratoryRate).label}
                      </em>
                    </dd>
                  </div>
                  <div>
                    <dt>Temperatura</dt>
                    <dd>
                      {reading.temperature} °C
                      <em className={`is-${classifyTemperature(reading.temperature).level}`}>
                        {classifyTemperature(reading.temperature).label}
                      </em>
                    </dd>
                  </div>
                  <div>
                    <dt>SpO₂</dt>
                    <dd>
                      {reading.spo2}%
                      <em className={`is-${spo2.level}`}>{spo2.label}</em>
                    </dd>
                  </div>
                </dl>
                <small>Registrado por {reading.recordedBy}</small>
              </article>
            )
          })}
      </div>
    </Modal>
  )
}
