import React from 'react';
import { useAppDispatch } from '../../app/hooks';
import type { AbstractEntity } from '../../entities/abstract';
import type { ConferenceEntity } from '../../entities/conference';
import { getFigureUrl } from '../conference/conferenceUtilities';
import { deleteFigure, updateFigure, uploadFigure } from './abstractSlice';

const CAPTION_MAX_LENGTH = 300;
const FIGURE_MAX_SIZE = 5 * 1024 * 1024;
const FIGURE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

interface FigureItemProps {
  figure: AbstractEntity['figures'][number];
  idx: number;
}

const FigureItem: React.FC<FigureItemProps> = (props) => {
  const { figure, idx } = props;
  const dispatch = useAppDispatch();
  const [caption, setCaption] = React.useState<string>(figure.caption ?? '');

  return (
    <div className="row g-3 align-items-start mb-3">
      <div className="col-md-3">
        <img className="img-fluid border" src={getFigureUrl(figure)} alt={`Figure ${idx + 1}`} />
      </div>
      <div className="col-md-9">
        <label htmlFor={`figure-caption-${figure.uuid}`} className="form-label">
          Caption of figure {idx + 1}
        </label>
        <textarea
          id={`figure-caption-${figure.uuid}`}
          className="form-control form-control-sm mb-2"
          rows={2}
          maxLength={CAPTION_MAX_LENGTH}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-sm btn-outline-primary me-2"
          disabled={caption.trim() === (figure.caption ?? '')}
          onClick={() => dispatch(updateFigure({ uuid: figure.uuid, caption: caption.trim() }))}
        >
          Save caption
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => dispatch(deleteFigure(figure.uuid))}
        >
          Delete figure
        </button>
      </div>
    </div>
  );
};

interface Props {
  conference: ConferenceEntity;
  abstract: AbstractEntity;
}

const AbstractEditorFigures: React.FC<Props> = (props) => {
  const { conference, abstract } = props;
  const dispatch = useAppDispatch();
  const [file, setFile] = React.useState<File | null>(null);
  const [caption, setCaption] = React.useState<string>('');
  const [fileError, setFileError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const figures = [...abstract.figures].sort((a, b) => a.position - b.position);

  if (conference.abstractMaxFigures <= 0) {
    return null;
  }

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected != null && !FIGURE_TYPES.includes(selected.type)) {
      setFileError('Only JPEG, PNG or GIF images are allowed.');
      setFile(null);
    } else if (selected != null && selected.size > FIGURE_MAX_SIZE) {
      setFileError('The file is too large (limit is 5MB).');
      setFile(null);
    } else {
      setFileError(null);
      setFile(selected);
    }
  };

  const onSubmitUpload: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (file != null) {
      dispatch(uploadFigure({ uuid: abstract.uuid, file, caption: caption.trim() })).then((action) => {
        if (uploadFigure.fulfilled.match(action)) {
          setFile(null);
          setCaption('');
          if (fileInputRef.current != null) {
            fileInputRef.current.value = '';
          }
        }
      });
    }
  };

  return (
    <section className="mb-4">
      <h4>Figures</h4>
      <p className="small text-secondary">
        Up to {conference.abstractMaxFigures} figure{conference.abstractMaxFigures > 1 ? 's' : ''} in JPEG, PNG or GIF
        format (max. 5MB each). Figures and captions are saved immediately.
      </p>
      {figures.map((figure, idx) => (
        <FigureItem key={`${figure.uuid}-${figure.caption}`} figure={figure} idx={idx} />
      ))}
      {figures.length < conference.abstractMaxFigures && (
        <form onSubmit={onSubmitUpload}>
          <div className="row g-2 align-items-start">
            <div className="col-md-4">
              <input
                ref={fileInputRef}
                className={`form-control form-control-sm${fileError != null ? ' is-invalid' : ''}`}
                type="file"
                accept={FIGURE_TYPES.join(',')}
                aria-label="Figure file"
                onChange={onChangeFile}
              />
              <div className="invalid-feedback">{fileError}</div>
            </div>
            <div className="col-md-6">
              <textarea
                className="form-control form-control-sm"
                rows={2}
                placeholder={`Figure caption (max. ${CAPTION_MAX_LENGTH} characters)`}
                aria-label="Figure caption"
                maxLength={CAPTION_MAX_LENGTH}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100" disabled={file == null}>
                Upload
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
};

export default AbstractEditorFigures;
