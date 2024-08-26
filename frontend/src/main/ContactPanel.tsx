import React from 'react';

import GeneralPage from '../common/GeneralPanel';

const ContactPanel: React.FC = () => {
  const title = 'Contact';
  return (
    <GeneralPage title={title}>
      <section className="mb-4 mb-sm-5">
        <h4>Technical Help</h4>
        <p>
          If you experience any technical difficulties please contact the site administrator cbs-is (at) ml.riken.jp.
        </p>
      </section>

      <section className="mb-4">
        <h4>Conference related help</h4>
        <p>
          Please direct any questions regarding abstract submission, the state of the abstracts or anything else related
          to the conference itself to the organizers of the corresponding conference.
        </p>
      </section>
    </GeneralPage>
  );
};

export default ContactPanel;
