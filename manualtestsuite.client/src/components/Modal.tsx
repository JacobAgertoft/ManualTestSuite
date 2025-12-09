import { ReactNode, MouseEvent } from 'react'
import './Modal.css'

type ModalProps = {
    isOpen: boolean
    title?: string
    onClose: () => void
    children: ReactNode
}

const Modal = ({ isOpen, title, onClose, children }: ModalProps) => {
    if (!isOpen) return null

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className="modal">
                <div className="modal-header">
                    {title && <h3>{title}</h3>}
                    <button className="modal-close" type="button" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    )
}

export default Modal
