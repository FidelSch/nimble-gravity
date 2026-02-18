import { useEffect, useState } from 'react';
import './JobsList.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function JobsList({ candidateData }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [repoUrls, setRepoUrls] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [successMessages, setSuccessMessages] = useState({});

  // Obtener lista de posiciones
  useEffect(() => {
    if (!BASE_URL) {
      setError('Missing BASE_URL environment variable');
      setLoading(false);
      return;
    }

    fetch(`${BASE_URL}/api/jobs/get-list`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Fallo al obtener lista de posiciones: ${response.status}`);
        }
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Manejar cambios en los inputs de repo URL
  const handleRepoUrlChange = (jobId, value) => {
    setRepoUrls({
      ...repoUrls,
      [jobId]: value,
    });
  };

  // Enviar postulación
  const handleSubmit = async (jobId) => {
    const repoUrl = repoUrls[jobId];

    if (!repoUrl) {
      alert('Por favor ingresa una URL de repositorio');
      return;
    }

    if (!repoUrl.startsWith('https://github.com/')) {
      alert('Por favor ingresa una URL válida de GitHub (https://github.com/...)');
      return;
    }

    setSubmitting((prev) => ({ ...prev, [jobId]: true }));
    setSuccessMessages((prev) => ({ ...prev, [jobId]: null }));

    try {
      const response = await fetch(`${BASE_URL}/api/candidate/apply-to-job`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: candidateData.uuid,
          jobId: jobId,
          candidateId: candidateData.candidateId,
          repoUrl: repoUrl,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok) {
          setSuccessMessages((prev) => ({
            ...prev,
            [jobId]: 'Postulación enviada exitosamente',
          }));
          setRepoUrls((prev) => ({ ...prev, [jobId]: '' }));
        } else {
          throw new Error('Server returned ok: false');
        }
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (err) {
      alert(`Error al enviar postulación: ${err.message}`);
    } finally {
      setSubmitting((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  if (loading) {
    return <div className="loading">Cargando posiciones disponibles...</div>;
  }

  if (error) {
    return <div className="error">Error al obtener posiciones: {error}</div>;
  }

  if (jobs.length === 0) {
    return <div className="no-jobs">No hay posiciones disponibles en este momento</div>;
  }

  return (
    <div className="jobs-container">
      <h2>Posiciones Disponibles</h2>
      <div className="jobs-list">
        {jobs.map((job) => (
          <div key={job.id} className="job-card">
            <div className="job-header">
              <h3>{job.title}</h3>
              <span className="job-id">ID: {job.id}</span>
            </div>

            <div className="job-form">
              <label htmlFor={`repo-${job.id}`}>Repositorio GitHub:</label>
              <input
                id={`repo-${job.id}`}
                type="url"
                placeholder="https://github.com/tu-usuario/tu-repo"
                value={repoUrls[job.id] || ''}
                onChange={(e) => handleRepoUrlChange(job.id, e.target.value)}
                disabled={submitting[job.id]}
              />

              <button
                className="submit-btn"
                onClick={() => handleSubmit(job.id)}
                disabled={submitting[job.id]}
              >
                {submitting[job.id] ? 'Enviando...' : 'Submit'}
              </button>

              {successMessages[job.id] && (
                <div className="success-message">{successMessages[job.id]}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JobsList;
