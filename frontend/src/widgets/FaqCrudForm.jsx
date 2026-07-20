import React from "react";
import "../ui/FaqCrudForm.css";

const FaqCrudForm = ({
  editingFaqId,
  notice,
  formData,
  isSaving,
  onStartCreate,
  onResetForm,
  onCloseForm,
  onSubmit,
  onFieldChange,
}) => {
  return (
    <div className="admin-panel__modal-backdrop" onClick={onCloseForm}>
      <div
        className="admin-panel__modal-panel admin-panel__form-card admin-panel__form-card--crud"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-panel__section-head admin-panel__section-head--modal">
          <div>
            <h2>{editingFaqId ? "Edit FAQ" : "Tambah FAQ baru"}</h2>
          </div>
          <div className="admin-panel__modal-actions">
            <button
              type="button"
              className="admin-panel__ghost"
              onClick={onCloseForm}
            >
              Tutup
            </button>
          </div>
        </div>

        {notice.message ? (
          <div
            className={`admin-panel__notice admin-panel__notice--${notice.type}`}
          >
            {notice.message}
          </div>
        ) : null}

        <form className="admin-panel__form" onSubmit={onSubmit}>
          <label className="admin-panel__field">
            <span>Pertanyaan</span>
            <textarea
              name="pertanyaan"
              placeholder="Contoh: Apa itu Romantik?"
              value={formData.pertanyaan}
              onChange={onFieldChange}
              rows={4}
            />
          </label>

          <label className="admin-panel__field">
            <span>Jawaban</span>
            <textarea
              name="jawaban"
              placeholder="Tulis jawaban untuk bot"
              value={formData.jawaban}
              onChange={onFieldChange}
              rows={6}
            />
          </label>

          <label className="admin-panel__field">
            <span>Keyword</span>
            <input
              type="text"
              name="keyword"
              placeholder="pisahkan dengan koma, misalnya: romatik, bantuan, faq"
              value={formData.keyword}
              onChange={onFieldChange}
            />
          </label>

          <div className="admin-panel__form-actions">
            <button
              type="submit"
              className="admin-panel__primary"
              disabled={isSaving}
            >
              {isSaving
                ? "Menyimpan..."
                : editingFaqId
                  ? "Simpan perubahan"
                  : "Simpan FAQ"}
            </button>
            <button
              type="button"
              className="admin-panel__ghost"
              onClick={onResetForm}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FaqCrudForm;
