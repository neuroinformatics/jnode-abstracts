import React from 'react';

import { DashboardConferenceTabProps } from './DashboardConferenceTab';

const DashboardConferenceTabInfo: React.FC<DashboardConferenceTabProps> = (props) => {
  const { conference } = props;
  const [info, setInfo] = React.useState<string>(conference.info ?? '');
  const [isChanged, setIsChanged] = React.useState<boolean>(false);

  const onChangeInfo: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setInfo(e.target.value);
    setIsChanged(true);
  };

  const onSubmitJson = React.useCallback<React.FormEventHandler<HTMLFormElement>>((e) => {
    e.preventDefault();
    // const text = info.trim();
    // save
    setIsChanged(false);
  }, []);
  return (
    <div className="row">
      <form onSubmit={onSubmitJson}>
        <div>
          <textarea
            className="form-control"
            placeholder="Conference info data. Use markdown."
            rows={12}
            maxLength={10000}
            onChange={onChangeInfo}
            value={info}
          />
        </div>
        <div>
          <button type="submit" className="btn btn-success my-3" disabled={!isChanged}>
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default DashboardConferenceTabInfo;
