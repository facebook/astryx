'use client';

import {
  XDSTable,
  XDSTableRow,
  XDSTableCell,
  XDSTableHeaderCell,
} from '@xds/core/Table';

const services = [
  {name: 'Auth Service', status: 'Healthy', uptime: '99.98%', region: 'US-East'},
  {name: 'Payment Gateway', status: 'Degraded', uptime: '99.12%', region: 'EU-West'},
  {name: 'Search Index', status: 'Healthy', uptime: '99.95%', region: 'US-West'},
  {name: 'Notification Hub', status: 'Healthy', uptime: '99.88%', region: 'AP-South'},
];

export default function TableRowShowcase() {
  return (
    <XDSTable hasHover isStriped>
      <thead>
        <XDSTableRow>
          <XDSTableHeaderCell>Service</XDSTableHeaderCell>
          <XDSTableHeaderCell>Status</XDSTableHeaderCell>
          <XDSTableHeaderCell>Uptime</XDSTableHeaderCell>
          <XDSTableHeaderCell>Region</XDSTableHeaderCell>
        </XDSTableRow>
      </thead>
      <tbody>
        {services.map(row => (
          <XDSTableRow key={row.name}>
            <XDSTableCell>{row.name}</XDSTableCell>
            <XDSTableCell>{row.status}</XDSTableCell>
            <XDSTableCell>{row.uptime}</XDSTableCell>
            <XDSTableCell>{row.region}</XDSTableCell>
          </XDSTableRow>
        ))}
      </tbody>
    </XDSTable>
  );
}
