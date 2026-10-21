import { useEffect, useState } from "react";
import { useUserStatus } from "../../hooks/useUserStatus";
import { logUserFeedback } from "../../utils/studyStore";
import FeedbackForm from "./FeedbackForm";

const activityFrequencyOptions = [
  { value: 1, label: "Rarely" },
  { value: 2, label: "Sometimes" },
  { value: 3, label: "Often" },
  { value: 4, label: "Daily" },
];

const Final: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [activityFrequency, setFrequency] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { status, setStatus } = useUserStatus();

  const handleSubmit = async () => {
    await logUserFeedback(status.userId, feedback, activityFrequency);
    setSubmitted(true);
  };

  useEffect(() => {
    if (submitted) setStatus((previous) => ({ ...previous, isFinished: true }));
  }, [submitted, setStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-500 p-6">
      <div className="bg-white p-8 rounded-md shadow-lg max-w-2xl w-full">
        <h1 className="text-2xl mb-4">You reached the end of the sample study</h1>
        <FeedbackForm
          textPrompt="Optional demo feedback"
          textAreaPlaceholder="Write a note about the workflow..."
          inputText={feedback}
          setInputText={setFeedback}
          inputRate={activityFrequency}
          setInputRate={setFrequency}
          radioLabel="How often do you use this kind of tool?"
          radioOptions={activityFrequencyOptions}
        />
        <button onClick={handleSubmit} className="mt-5 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Finish demo
        </button>
      </div>
    </div>
  );
};

export default Final;
