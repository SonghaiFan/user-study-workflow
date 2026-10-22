
import { BaseModal } from "../../ui/base-modal";
import { ModalButton } from "../../ui/modal-button";

interface ConfirmSubmitModalProps {
  isOpen?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmSubmitModal({
  isOpen = false,
  onConfirm,
  onCancel,
}: ConfirmSubmitModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onCancel}>
      <h3 className="text-lg font-semibold mb-4">Confirm Submission</h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to submit this answer?
      </p>
      <div className="flex gap-3 justify-end">
        <ModalButton variant="secondary" onClick={onCancel}>
          Cancel
        </ModalButton>
        <ModalButton variant="primary" onClick={onConfirm}>
          Submit
        </ModalButton>
      </div>
    </BaseModal>
  );
}
