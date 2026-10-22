import { RatingScale } from "./ui/components/ui/rating-scale";
import { MultipleSelect } from "./ui/components/task/quiz-types/MultipleSelect";
import { SequnceRank } from "./ui/components/task/quiz-types/SequenceRank";
import { DragPairing } from "./ui/components/task/quiz-types/DragPairing";
import { TextInput } from "./ui/components/task/quiz-types/TextInput";
import { SingleSelect } from "./ui/components/task/quiz-types/SingleSelect";
import type { Answer, ResponseDefinition } from "./types";

export function ResponseInput({
  response,
  answer,
  onAnswer,
  disabled,
}: {
  response: ResponseDefinition;
  answer: Answer;
  onAnswer: (answer: Answer) => void;
  disabled: boolean;
}) {
  if (
    response.type === "single-choice" &&
    response.options.every((o) => !o.image)
  )
    return (
      <SingleSelect
        options={response.options.map((o) => o.id)}
        optionLabels={Object.fromEntries(
          response.options.map((o) => [o.id, o.label]),
        )}
        value={typeof answer === "string" ? answer : ""}
        onChange={onAnswer}
        disabled={disabled}
      />
    );
  if (response.type === "text")
    return (
      <TextInput
        value={typeof answer === "string" ? answer : ""}
        onChange={onAnswer}
        disabled={disabled}
      />
    );
  if (response.type === "rating")
    return <RatingScale label="Rating" leftLabel="" rightLabel="" value={typeof answer === "number" ? answer : null} onChange={onAnswer} disabled={disabled} values={Array.from({length: response.max - response.min + 1}, (_, i) => response.min + i)} />;
  if (response.type === "multiple-choice" && response.options.every((o) => !o.image))
    return <MultipleSelect options={response.options.map((o) => o.id)} optionLabels={Object.fromEntries(response.options.map((o) => [o.id, o.label]))} value={Array.isArray(answer) ? answer : []} onChange={onAnswer} disabled={disabled} />;
  if (response.type === "pairing") {
    const value = answer && typeof answer === "object" && !Array.isArray(answer) ? answer : {};
    // Prefix UI keys so left and right IDs may overlap; stored answers retain original IDs.
    return <DragPairing options={{leftItems: response.options.map((o) => `left:${o.id}`), rightItems: response.targets.map((o) => `right:${o.id}`), labels: Object.fromEntries([...response.options.map((o) => [`left:${o.id}`, o.label]), ...response.targets.map((o) => [`right:${o.id}`, o.label])])}} value={Object.fromEntries(Object.entries(value).map(([left, right]) => [`left:${left}`, `right:${right}`]))} onChange={(pairs) => onAnswer(Object.fromEntries(Object.entries(pairs).map(([left, right]) => [left.slice(5), right.slice(6)])))} disabled={disabled} />;
  }
  if (response.type === "ranking")
    return <div><SequnceRank options={response.options} value={Array.isArray(answer) ? answer : []} onChange={onAnswer} disabled={disabled} /><button disabled={disabled} onClick={() => onAnswer(Array.isArray(answer) ? answer : response.options.map((o) => o.id))}>Use this order</button></div>;
  return (
    <fieldset disabled={disabled} className="choices">
      <legend className="sr-only">Your answer</legend>
      {response.options.map((option) => {
        const selected =
          response.type === "single-choice"
            ? answer === option.id
            : Array.isArray(answer) && answer.includes(option.id);
        return (
          <label
            className={`choice ${selected ? "selected" : ""}`}
            key={option.id}
          >
            <input
              type={response.type === "single-choice" ? "radio" : "checkbox"}
              name="quiz-answer"
              checked={selected}
              onChange={() =>
                onAnswer(
                  response.type === "single-choice"
                    ? option.id
                    : selected
                      ? (answer as string[]).filter((id) => id !== option.id)
                      : [...(Array.isArray(answer) ? answer : []), option.id],
                )
              }
            />
            {option.image && <img src={option.image} alt="" />}
            <span>{option.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
