import React, { useEffect, useMemo, useState } from "react";
import FaqCrudForm from "./FaqCrudForm";
import "../ui/FaqCrudList.css";

const API_BASE_URL = "http://localhost:3000/api/admin";

const FaqCrudWidget = () => {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    pertanyaan: "",
    jawaban: "",
    keyword: "",
  });
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", message: "" });

  useEffect(() => {
    const loadFaqs = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/faq`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(result.message || "Gagal memuat data FAQ.");
        }

        setFaqs(result.data || []);
      } catch (error) {
        setNotice({
          type: "error",
          message:
            error.message ||
            "Tidak bisa terhubung ke server FAQ. Silakan coba lagi.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return faqs;
    }

    return faqs.filter((faq) => {
      const pertanyaan = String(faq.pertanyaan || "").toLowerCase();
      const jawaban = String(faq.jawaban || "").toLowerCase();
      const keyword = String(faq.keyword || "").toLowerCase();

      return (
        pertanyaan.includes(query) ||
        jawaban.includes(query) ||
        keyword.includes(query)
      );
    });
  }, [faqs, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredFaqs.length / pageSize)),
    [filteredFaqs.length, pageSize],
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredFaqs.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredFaqs, pageSize]);

  const clearNotice = () => setNotice({ type: "", message: "" });

  const resetForm = () => {
    setFormData({
      pertanyaan: "",
      jawaban: "",
      keyword: "",
    });
    setEditingFaqId(null);
  };

  const startCreate = () => {
    clearNotice();
    resetForm();
    setIsFormVisible(true);
  };

  const startEdit = (faq) => {
    clearNotice();
    setEditingFaqId(faq.id);
    setFormData({
      pertanyaan: faq.pertanyaan || "",
      jawaban: faq.jawaban || "",
      keyword: faq.keyword || "",
    });
    setIsFormVisible(true);
  };

  const closeForm = () => {
    clearNotice();
    resetForm();
    setIsFormVisible(false);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const refreshFaqs = async (token) => {
    const response = await fetch(`${API_BASE_URL}/faq`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Gagal memuat data FAQ.");
    }

    setFaqs(result.data || []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearNotice();

    const token = localStorage.getItem("adminToken");
    if (!token) {
      return;
    }

    if (
      !formData.pertanyaan.trim() ||
      !formData.jawaban.trim() ||
      !formData.keyword.trim()
    ) {
      setNotice({
        type: "error",
        message: "Pertanyaan, jawaban, dan keyword wajib diisi.",
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        editingFaqId
          ? `${API_BASE_URL}/faq/${editingFaqId}`
          : `${API_BASE_URL}/faq`,
        {
          method: editingFaqId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal menyimpan data FAQ.");
      }

      await refreshFaqs(token);
      setNotice({
        type: "success",
        message:
          result.message ||
          (editingFaqId
            ? "FAQ berhasil diperbarui."
            : "FAQ berhasil ditambahkan."),
      });
      resetForm();
      setIsFormVisible(false);
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Gagal menyimpan data FAQ.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (faqId) => {
    clearNotice();

    const isConfirmed = window.confirm(
      "Hapus FAQ ini? Tindakan ini tidak bisa dibatalkan.",
    );

    if (!isConfirmed) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/faq/${faqId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || result.status !== "success") {
        throw new Error(result.message || "Gagal menghapus data FAQ.");
      }

      await refreshFaqs(token);
      setNotice({
        type: "success",
        message: result.message || "FAQ berhasil dihapus.",
      });

      if (editingFaqId === faqId) {
        resetForm();
        setIsFormVisible(false);
      }
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Gagal menghapus data FAQ.",
      });
    }
  };

  const uniqueKeywordCount = useMemo(() => {
    const keywords = faqs
      .flatMap((faq) => String(faq.keyword || "").split(","))
      .map((keyword) => keyword.trim())
      .filter(Boolean);

    return new Set(keywords).size;
  }, [faqs]);

  return (
    <>
      <section className="admin-panel__search-panel">
        <label className="admin-panel__search admin-panel__search--wide">
          <h3>Cari FAQ</h3>
          <input
            type="search"
            placeholder="Cari pertanyaan, jawaban, atau keyword"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </label>
      </section>

      <section className="admin-panel__stats">
        <div className="admin-panel__card">
          <span>Total FAQ</span>
          <strong>{faqs.length}</strong>
        </div>
        <div className="admin-panel__card">
          <span>Hasil pencarian</span>
          <strong>{filteredFaqs.length}</strong>
        </div>
        <div className="admin-panel__card">
          <span>Keyword unik</span>
          <strong>{uniqueKeywordCount}</strong>
        </div>
      </section>

      <section className="admin-panel__workspace admin-panel__workspace--stacked">
        <div className="admin-panel__workspace-header">
          <div>
            <h3>Tambahkan FAQ Baru</h3>
          </div>

          <button
            type="button"
            className="admin-panel__primary"
            onClick={startCreate}
          >
            Add +
          </button>
        </div>

        {isFormVisible ? (
          <FaqCrudForm
            editingFaqId={editingFaqId}
            notice={notice}
            formData={formData}
            isSaving={isSaving}
            onStartCreate={startCreate}
            onResetForm={resetForm}
            onCloseForm={closeForm}
            onSubmit={handleSubmit}
            onFieldChange={handleFieldChange}
          />
        ) : null}

        <div className="admin-panel__table-card admin-panel__table-card--list">
          {isLoading ? (
            <div className="admin-panel__empty-state">Memuat data FAQ...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="admin-panel__empty-state">
              Tidak ada data yang cocok dengan pencarian.
            </div>
          ) : (
            <>
              <div className="admin-panel__table-wrap">
                <div className="admin-panel__table">
                  <div className="admin-panel__table-row admin-panel__table-row--head">
                    <span>Pertanyaan</span>
                    <span>Jawaban</span>
                    <span>Keyword</span>
                    <span>Action</span>
                  </div>

                  {paginatedFaqs.map((faq) => (
                    <div className="admin-panel__table-row" key={faq.id}>
                      <span className="admin-panel__cell admin-panel__cell--question">
                        {faq.pertanyaan}
                      </span>
                      <span className="admin-panel__cell admin-panel__cell--answer">
                        {faq.jawaban}
                      </span>
                      <span className="admin-panel__cell admin-panel__cell--keyword">
                        {faq.keyword}
                      </span>
                      <span className="admin-panel__actions">
                        <button
                          type="button"
                          className="admin-panel__icon-button"
                          onClick={() => startEdit(faq)}
                          aria-label={`Edit FAQ ${faq.pertanyaan}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="admin-panel__icon-button admin-panel__icon-button--danger"
                          onClick={() => handleDelete(faq.id)}
                          aria-label={`Hapus FAQ ${faq.pertanyaan}`}
                        >
                          Hapus
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-panel__pagination">
                <div className="admin-panel__table-tools">
                  <div className="admin-panel__page-info">
                    Menampilkan{" "}
                    {filteredFaqs.length === 0
                      ? 0
                      : (currentPage - 1) * pageSize + 1}
                    -{Math.min(currentPage * pageSize, filteredFaqs.length)}{" "}
                    dari {filteredFaqs.length} FAQ
                  </div>

                  {/* Kelompokkan dropdown dan tombol agar rapi sejajar di sebelah kanan */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "24px",
                    }}
                  >
                    <label className="admin-panel__page-size">
                      <span>Rows per page</span>
                      <select
                        value={pageSize}
                        onChange={(event) =>
                          setPageSize(Number(event.target.value))
                        }
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                      </select>
                    </label>

                    {/* Bungkus tombol Prev & Next pakai class yang sudah ada di CSS */}
                    <div className="admin-panel__pagination-pages">
                      <button
                        type="button"
                        className="admin-panel__pagination-button"
                        onClick={() =>
                          setCurrentPage((page) => Math.max(page - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>

                      <button
                        type="button"
                        className="admin-panel__pagination-button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(page + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default FaqCrudWidget;
