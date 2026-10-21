import { useEffect, useState } from "react";
import ConsentForm from "./ConsentForm";
import WindowSizeIndicator from "./WindowSizeIndicator";
import MarkdownRenderer from "./MarkdownRenderer";
import { FaCheck } from "react-icons/fa";
import { useUserStatus } from "../../hooks/useUserStatus";
import { Status } from "../../contexts/UserStatusContext";
import { recordConsent } from "../../utils/studyStore";

interface LandingProps {
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export default function Landing({ handleSubmit }: LandingProps) {
  const [showConsent, setShowConsent] = useState(false);
  const { status, setStatus } = useUserStatus();
  const [inputUserId, setInputUserId] = useState(status.userId || "demo-participant");

  useEffect(() => {
    if (status.userId) setInputUserId(status.userId);
  }, [status.userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUserId(e.target.value);
    setStatus((prevStatus) => ({ ...prevStatus, userId: e.target.value }));
  };

  const handleConsentSubmit = () => {
    if (inputUserId.trim()) void recordConsent(inputUserId.trim());
    setShowConsent(false);
    setStatus((prevStatus: Status) => ({ ...prevStatus, isConsented: true }));
  };

  const isIdFromURL = new URLSearchParams(window.location.search).has("participantId") || new URLSearchParams(window.location.search).has("PROLIFIC_PID");
  const isLoginDisabled = !status.isConsented || !inputUserId.trim();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500">
      <header className="fixed sm:top-0 sm:left-0 top-10 text-white p-6 py-4">
        <h1 className="sm:text-xl text-3xl font-semibold">User Study Workflow Demo</h1>
      </header>
      <WindowSizeIndicator />
      <div className="mt-20 p-8 min-w-[500px] w-1/3">
        <form onSubmit={handleSubmit} className="flex flex-col items-center bg-white p-8 rounded-md shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Participant start</h2>
          <label className="text-gray-600 mb-2" htmlFor="participant-id">Demo participant ID</label>
          <input
            id="participant-id"
            type="text"
            value={inputUserId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            readOnly={isIdFromURL}
          />
          <p className="text-sm text-gray-600 mt-3">A sample ID is prefilled so you can try the complete flow locally.</p>
          <div className="my-4">
            {status.isConsented ? (
              <span className="px-4 py-2 font-semibold text-green-700 flex items-center"><FaCheck className="mr-2" /> Demo consent acknowledged</span>
            ) : (
              <button type="button" className="px-4 py-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600" onClick={() => setShowConsent(true)}>
                Read the consent template
              </button>
            )}
          </div>
          <button type="submit" className={`px-4 py-2 font-semibold text-white rounded-md ${isLoginDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`} disabled={isLoginDisabled}>
            Start demo
          </button>
          <hr className="w-full my-4" />
          <p className="text-sm text-amber-800 bg-amber-50 p-3 rounded">
            Demo mode only: responses are stored in this browser and are not sent to a server. Do not use this build to collect real participant data.
          </p>
        </form>
      </div>
      {showConsent && (
        <ConsentForm handleSubmit={handleConsentSubmit} handleCancel={() => setShowConsent(false)} isSubmitted={status.isConsented}>
          <MarkdownRenderer path="/markdown/consent.md" className="xl:w-full" />
        </ConsentForm>
      )}
    </div>
  );
}
