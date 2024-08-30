import React from 'react';
import { AbstractSimpleEntity } from '../../entities/abstract';
import { ConferenceEntity } from '../../entities/conference';
import {
  formatAbstractCitation,
  formatAbstractCopyright,
  formatAffiliation,
  formatAuthorAffiliations,
  formatAuthorName,
  getFigureUrl,
} from './conferenceUtilities';

interface Props {
  conference: ConferenceEntity;
  abstract: AbstractSimpleEntity;
}

const AbstractPanel: React.FC<Props> = (props) => {
  const { conference, abstract } = props;
  return (
    <div className="abstract my-3">
      <h3 className="title mb-3">{abstract.title}</h3>
      <ul className="authors mb-3">
        {abstract.authors.map((author) => {
          return (
            <li key={author.uuid} className="author">
              {formatAuthorName(author)}
              <sup>{formatAuthorAffiliations(author, abstract.affiliations)}</sup>
            </li>
          );
        })}
      </ul>
      <ol className="affiliations mb-3">
        {abstract.affiliations.map((affiliation) => (
          <li key={affiliation.uuid} className="text-secondary">
            <span className=" fst-italic">{formatAffiliation(affiliation)}</span>
          </li>
        ))}
      </ol>
      {abstract.doi != null && (
        <div className="doi mb-3 fs-5">
          doi: <a href={`https://doi.org/${abstract.doi}`}>{abstract.doi}</a>
        </div>
      )}
      <div className="text mb-3">{abstract.text}</div>
      {abstract.figures.length > 0 && (
        <div className="figures row justify-content-center mb-3">
          {abstract.figures.map((figure, idx) => (
            <div key={figure.uuid} className="figure col-sm-7">
              <div className="mb-2">
                <img className="img-fluid" src={getFigureUrl(figure)} alt={figure.caption} />
              </div>
              <div className="caption">{`Figure ${idx + 1}: ${figure.caption}`}</div>
            </div>
          ))}
        </div>
      )}
      {abstract.acknowledgements != null && (
        <div className="acknowledgements mb-3">
          <h5>Acknowledgements</h5>
          <div>{abstract.acknowledgements}</div>
        </div>
      )}
      {abstract.references.length > 0 && (
        <div className="references mb-3">
          <h5>References</h5>
          <ol>
            {abstract.references.map((reference) => {
              const text = reference.text || reference.link;
              const html = reference.link ? (
                <a href={reference.link} target="_blank">
                  {text}
                </a>
              ) : (
                text
              );
              const doi = reference.doi?.match(/10\..*/)?.[0] ?? null;
              const doiLink = doi ? (
                <a href={`https://doi.org/${doi}`} target="_blank">
                  https://doi.org/{doi}
                </a>
              ) : null;
              return (
                <li key={reference.uuid}>
                  {html}
                  {doiLink && <>, {doiLink}</>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
      <hr className="my-4" />
      <div className="copyright mb-2">
        Copyright: <span className="text-secondary">{formatAbstractCopyright(conference, abstract)}</span>
      </div>
      <div className="citation mb-2">
        Citation: <span className="text-secondary">{formatAbstractCitation(conference, abstract)}</span>
      </div>
    </div>
  );
};

export default AbstractPanel;
