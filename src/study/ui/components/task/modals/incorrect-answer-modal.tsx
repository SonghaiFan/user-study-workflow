
import { BaseModal } from "../../ui/base-modal";
import { ModalButton } from "../../ui/modal-button";

interface IncorrectAnswerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function IncorrectAnswerModal({
  isOpen = false,
  onClose,
}: IncorrectAnswerModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <h3 className="text-lg font-semibold mb-4 text-red-600">
        Incorrect Answer
      </h3>
      <p className="text-gray-600 mb-6">
        That's not the correct answer. Please try again.
      </p>
      <div className="flex justify-end">
        <ModalButton variant="primary" onClick={onClose}>
          Try Again
        </ModalButton>
      </div>
    </BaseModal>
  );
}
