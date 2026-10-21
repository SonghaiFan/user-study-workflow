import { useUserStatus } from "../../hooks/useUserStatus";
import { clearDemoData, downloadParticipantDemoData } from "../../utils/studyStore";

const Ending = () => {
  const { status } = useUserStatus();
  const resetDemo = () => {
    clearDemoData();
    window.location.assign("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 p-6">
      <div className="bg-white p-8 rounded-md shadow-lg max-w-2xl">
        <h2 className="text-2xl mb-4">Demo complete</h2>
        <p className="text-sm text-gray-700 mt-4">
          You completed the sample participant workflow. The demo events remain in this browser until you clear them.
        </p>
        <div className="flex flex-wrap gap-3 mt-6">
          <button onClick={() => downloadParticipantDemoData(status.userId)} className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Download this demo participant&apos;s events
          </button>
          <button onClick={resetDemo} className="px-4 py-2 font-semibold text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">
            Clear demo data and restart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ending;
