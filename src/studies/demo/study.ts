import type { Study } from "../../study/types";

export const study: Study = {
    id: "demo",
    version: "8",
    screenCheck: true,
    title: "Quiz",
    description:
      "Explore the interactive component on the left and answer questions on the right.",
    consent: {
      version: "demo-1",
      text: "Demo only. Use synthetic answers. Test data is separate from formal study data; you can export it and leave at any time. This placeholder is not approved consent wording.",
    },
    completion: {
      title: "Thank You!",
      description: "You have completed the study. Thank you for your time and feedback.",
      codeLabel: "Your Completion Code",
      instructions: "Copy this code or use the return button to complete your participation on the recruitment platform.",
      returnLabel: "Return to recruitment platform",
      footer: "You can now close this window or tab after completing your platform submission.",
    },
    feedback: {
      submitLabel: "Submit to Get Completion Code",
      footer: "Your completion page will appear after your feedback has been saved.",
      pages: [
        {
          title: "Overall Study Experience",
          subtitle: "Please reflect on the entire study.",
          fields: [
            { id: "overall", label: "Overall experience", description: "How was your experience with the study?", response: { type: "rating", min: 1, max: 5 }, leftLabel: "Very poor", rightLabel: "Excellent" },
            { id: "instructions", label: "Clarity of instructions", response: { type: "rating", min: 1, max: 5 }, leftLabel: "Unclear", rightLabel: "Very clear" },
          ],
        },
        {
          title: "Final Comments",
          subtitle: "Share anything else about your experience.",
          fields: [{ id: "comments", label: "Additional feedback (optional)", response: { type: "text", maxLength: 10000 }, required: false, placeholder: "What could we improve?", prompts: ["Anything that was confusing", "Suggestions for future studies"] }],
        },
      ],
    },
    blocks: [
      {
        id: "training",
        title: "Training",
        mode: "training",
        introduction: [
          {
            title: "Study Introduction",
            content: "First, learn the interface and watch the tutorial. Then complete practice questions before starting the main tasks.\n\nLeft: interact with the click counter.\nRight: read each question, enter your answer, and submit.\n\nDuring training, incorrect answers can be retried. Your counter clicks and quiz answers are independent.",
          },
          {
            title: "Video Guide",
            content: "This area is reserved for a short demonstration of the interaction and answer controls. In this template, you can continue directly to training.",
            video: { label: "Tutorial video placeholder" },
          },
        ],
        instructions:
          "Practice before the main tasks. Try the click counter on the left, then answer on the right. Follow each practice question's instructions. Incorrect answers can be retried; correct answers advance to the next question.",
        quizzes: [
          {
            id: "practice-choice",
            stimulusId: "placeholder",
            question: "For this practice question, select Option B.",
            response: {
              type: "single-choice",
              options: [
                { id: "a", label: "Option A" },
                { id: "b", label: "Option B" },
                { id: "c", label: "Option C" },
              ],
            },
            correctAnswer: "b",
          },
          {
            id: "practice-multiple",
            stimulusId: "placeholder",
            question: "For this practice question, select both Option A and Option C.",
            response: {
              type: "multiple-choice",
              options: [
                { id: "a", label: "Option A" },
                { id: "b", label: "Option B" },
                { id: "c", label: "Option C" },
              ],
            },
            correctAnswer: ["a", "c"],
          },
        ],
      },
      {
        id: "quiz",
        title: "Quiz",
        startLabel: "Start Tasks",
        introduction: [{
          title: "Training Complete!",
          content: "Great job finishing the training!",
          notice: {
            tone: "success",
            heading: "Main Tasks Begin Now",
            content: "You will complete six questions using the same interface. These Demo tasks have no time limit.",
            bullets: ["Read each question carefully.", "Use the answer format shown on the right.", "Review your answer before confirming submission.", "Unlike training, submitted task answers cannot be retried."],
          },
          footer: "Ready? Click Start Tasks to begin.",
        }],
        feedback: {
          submitLabel: "Continue to Next Section",
          pages: [
            { title: "Task Feedback", subtitle: "Rate your experience with this task block.", fields: [
              { id: "ease", label: "Ease of use", response: { type: "rating", min: 1, max: 5 }, leftLabel: "Difficult", rightLabel: "Very easy" },
              { id: "helpfulness", label: "Helpfulness of the interface", response: { type: "rating", min: 1, max: 5 }, leftLabel: "Not helpful", rightLabel: "Very helpful" },
            ] },
            { title: "Comments", subtitle: "Share feedback about this task block.", fields: [
              { id: "comments", label: "Task feedback", description: "Please share your thoughts about:", response: { type: "text", maxLength: 10000 }, prompts: ["What worked well or was difficult", "How the interaction or questions could be improved"], placeholder: "Describe your experience with the tasks..." },
            ] },
          ],
        },
        instructions:
          "Answer each question, then submit to continue. There are no right or wrong answers.",
        mode: "task",
        quizzes: [
          {
            id: "choice",
            stimulusId: "placeholder",
            question: "Choose one option.",
            response: {
              type: "single-choice",
              options: [
                { id: "a", label: "Option A" },
                { id: "b", label: "Option B" },
                { id: "c", label: "Option C" },
              ],
            },
          },
          {
            id: "multiple",
            stimulusId: "placeholder",
            question: "Choose one or more options.",
            response: { type: "multiple-choice", options: [
              { id: "a", label: "Option A" },
              { id: "b", label: "Option B" },
              { id: "c", label: "Option C" },
            ] },
          },
          {
            id: "ranking",
            stimulusId: "placeholder",
            question: "Put the options in your preferred order.",
            response: { type: "ranking", options: [
              { id: "a", label: "Option A" },
              { id: "b", label: "Option B" },
              { id: "c", label: "Option C" },
            ] },
          },
          {
            id: "pairing",
            stimulusId: "placeholder",
            question: "Choose a match for each item.",
            response: { type: "pairing", options: [
              { id: "a", label: "Item A" },
              { id: "b", label: "Item B" },
            ], targets: [
              { id: "1", label: "Match 1" },
              { id: "2", label: "Match 2" },
            ] },
          },
          {
            id: "rating",
            stimulusId: "placeholder",
            question: "Choose a rating from 1 to 5.",
            response: { type: "rating", min: 1, max: 5 },
          },
          {
            id: "comment",
            stimulusId: "placeholder",
            question: "Enter a short response (optional).",
            response: { type: "text" },
            required: false,
            allowSkip: true,
          },
        ],
      },
    ],
  };
