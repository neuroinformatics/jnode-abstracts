import dayjs from 'dayjs';
import type React from 'react';
import { Badge } from 'react-bootstrap';
import type { AbstractEntity } from '../../entities/abstract';
import { formatStateName, STATE_VARIANTS } from './abstractUtilities';

interface Props {
  abstract: AbstractEntity;
}

const AbstractStateLogPanel: React.FC<Props> = (props) => {
  const { abstract } = props;
  if (abstract.stateLogs.length === 0) {
    return null;
  }
  return (
    <div className="state-log mb-4 d-print-none">
      <h5>
        State: <Badge bg={STATE_VARIANTS[abstract.state]}>{formatStateName(abstract.state)}</Badge>
      </h5>
      <table className="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>State</th>
            <th>Editor</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          {abstract.stateLogs.map((log) => (
            <tr key={log.uuid}>
              {/* timestamps are sent in UTC without an offset, as the server runs in UTC */}
              <td className="text-nowrap">{dayjs(`${log.timestamp}Z`).format('YYYY-MM-DD HH:mm')}</td>
              <td className="text-nowrap">{formatStateName(log.state)}</td>
              <td className="text-nowrap">{log.editor}</td>
              <td className="text-break">{log.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AbstractStateLogPanel;
