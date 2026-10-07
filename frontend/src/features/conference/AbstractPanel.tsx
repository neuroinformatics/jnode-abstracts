import { MathJax } from 'better-react-mathjax';
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import type { AbstractSimpleEntity } from '../../entities/abstract';
import type { ConferenceEntity } from '../../entities/conference';
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

interface FigureModalState {
  show: boolean;
  idx: number;
}

const AbstractPanel: React.FC<Props> = (props) => {
  const { conference, abstract } = props;

  const [figureModalState, setFigureModalState] = React.useState<FigureModalState>({ show: false, idx: 0 });
  const onShowFigureModal = (idx: number) => {
    setFigureModalState({ show: true, idx: idx });
  };
  const onHideFigureModal = () => {
    setFigureModalState({ show: false, idx: 0 });
  };

  return (
    <div className="abstract my-3">
      <h3 className="title mb-3">
        <MathJax>{abstract.title}</MathJax>
      </h3>
      <ul className="authors mb-3">
        {abstract.authors.map((author) => {
          return (
            <li key={author.uuid} className="author fs-5">
              {formatAuthorName(author)}
              <sup>{formatAuthorAffiliations(author, abstract.affiliations)}</sup>
            </li>
          );
        })}
      </ul>
      <ol className="affiliations mb-3">
        {abstract.affiliations.map((affiliation) => (
          <li key={affiliation.uuid} className="affiliation text-secondary">
            <span className="fst-italic">{formatAffiliation(affiliation)}</span>
          </li>
        ))}
      </ol>
      {abstract.doi != null && (
        <div className="doi mb-3 fs-5">
          doi: <a href={`https://doi.org/${abstract.doi}`}>{abstract.doi}</a>
        </div>
      )}
      <div className="text mb-3">
        <MathJax>{abstract.text}</MathJax>
      </div>
      {abstract.figures.length > 0 && (
        <div className="figures row justify-content-center mb-3">
          {abstract.figures.map((figure, idx) => (
            <div key={figure.uuid} className="figure col-sm-7">
              <div className="mb-2">
                <button
                  type="button"
                  className="btn-plain d-block w-100"
                  aria-label={`Enlarge figure ${idx + 1}`}
                  onClick={() => {
                    onShowFigureModal(idx);
                  }}
                >
                  <img className="img-fluid" src={getFigureUrl(figure)} alt={figure.caption} />
                </button>
              </div>
              <div className="caption">{`Figure ${idx + 1}: ${figure.caption}`}</div>
            </div>
          ))}
          <Modal show={figureModalState.show} onHide={onHideFigureModal} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>Figure {figureModalState.idx + 1}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <img
                className="img-fluid"
                src={getFigureUrl(abstract.figures[figureModalState.idx])}
                alt={abstract.figures[figureModalState.idx].caption}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={onHideFigureModal}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
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
                <a href={reference.link} target="_blank" rel="noopener">
                  {text}
                </a>
              ) : (
                text
              );
              const doi = reference.doi?.match(/10\..*/)?.[0] ?? null;
              const doiLink = doi ? (
                <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener">
                  https://doi.org/{doi}
                </a>
              ) : null;
              return (
                <li key={reference.uuid}>
                  {html}
                  {doiLink && <> {doiLink}</>}
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
