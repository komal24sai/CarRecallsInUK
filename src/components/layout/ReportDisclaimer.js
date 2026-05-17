export default function ReportDisclaimer() {
  return (
    <div style={{
      borderTop: '1px solid #262B38',
      marginTop: '4rem',
      paddingTop: '2rem',
      color: '#64748B',
      fontSize: '0.8rem',
      lineHeight: '1.5',
      textAlign: 'left'
    }}>
      <p style={{ margin: 0 }}>
        <strong>Important Notice:</strong> This report is based on statistical analysis of DVSA MOT records and published repair cost data. It is a predictive tool, not a mechanical inspection. Failure probabilities are population-level estimates — your specific vehicle may differ. <strong>IsThisCarSafe</strong> accepts no liability for purchasing decisions made based on this report. Always commission a physical inspection before buying a vehicle.
      </p>
      <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.75rem', color: '#475569' }}>
        Contains public sector information licensed under the Open Government Licence v3.0. Sourced from Driver and Vehicle Standards Agency (DVSA) datasets.
      </p>
    </div>
  );
}
