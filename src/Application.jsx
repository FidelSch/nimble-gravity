import { useEffect, useState } from 'react';
import JobsList from './JobsList';
import './Application.css';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const EMAIL_ADDR = import.meta.env.VITE_EMAIL_ADDR;

function Application() {
  const [candidateData, setCandidateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!BASE_URL || !EMAIL_ADDR) {
      setError('Missing environment variables: VITE_BASE_URL and/or VITE_EMAIL_ADDR');
      setLoading(false);
      return;
    }

    const query = new URLSearchParams({ email: EMAIL_ADDR }).toString();

    fetch(`${BASE_URL}/api/candidate/get-by-email?${query}`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      })
      .then((result) => {
        setCandidateData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Cargando datos del candidato...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!candidateData) return <div>No candidate data found</div>;

  return (
    <div className="application-container">
      <div className="candidate-info">
        <h2>Bienvenido, {candidateData.firstName} {candidateData.lastName}</h2>
        <p>Email: {candidateData.email}</p>
      </div>
      <JobsList candidateData={candidateData} />
    </div>
  );
}

export default Application;