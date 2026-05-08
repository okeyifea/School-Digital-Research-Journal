import React , { useState, useEffect } from "react";
//import styled from "styled-components";
//import Header from "./Header";
import Layout from "./Common/layout";
import Modal from "./Common/Modal.jsx";

import {
  Main,
  HeaderSection,
  FormWrapper,
  FormGroup,
  Label,
  Input,
  Select,
  TextArea,
  FileInput,
  FileHelp,
  CheckboxLabel,
  ButtonGroup,
  SubmitButton,
  ResetButton
} from "../Style/SubmitStyle.jsx";

import { API_URL } from "../api/Auth.js";


const Submit = ({ user, setUser }) => {
  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    category: "",
    abstract: "",
    pdf: null,
    confirm: false
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState({ open: false, title: "", message: "" });
  const [categories, setCategories] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] || null });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
    const token = user?.token || localStorage.getItem("token");
    if (!token) {
      throw new Error("You must be logged in to submit a paper.");
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("authors", formData.authors);      
    data.append("abstract", formData.abstract);
    data.append("category", formData.category);
    data.append("pdf", formData.pdf);


      const res = await fetch(`${API_URL}/research`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Submission failed");
      }
      setMessage(result.message || "Paper submitted");
      setModal({
        open: true,
        title: "Submission Successful",
        message: result.message || "Paper submitted successfully"
      });
      setFormData({
        title: "",
        authors: "",
        category: "",
        abstract: "",
        pdf: null,
        confirm: false
      });
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Submission failed");
      setModal({
        open: true,
        title: "Submission Failed",
        message: err.message || "Submission failed. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      authors: "",
      category: "",
      abstract: "",
      pdf: null,
      confirm: false
    });
    setMessage("");
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/research/categories`);
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data?.data || []);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Layout user={user} setUser={setUser}>
        <Main>
          <HeaderSection>
            <h1 style={{ fontSize: "35px", fontWeight: "800", margin: "0", color: "white" }}>
              Submit Your Research Paper
            </h1>
            <p>Contribute to our growing collection of academic research</p>
          </HeaderSection>

          <FormWrapper>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="title">Paper Title *</Label>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter the title of your research paper"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="authors">Author *</Label>
                <Input
                  type="text"
                  id="authors"
                  name="authors"
                  placeholder="Enter author names (comma-separated)"
                  value={formData.authors}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="category">Faculty / College *</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a faculty or college</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="abstract">Abstract *</Label>
                <TextArea
                  id="abstract"
                  name="abstract"
                  rows="6"
                  placeholder="Provide a brief summary of your research (150-250 words)"
                  value={formData.abstract}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="pdf">Upload Paper (PDF) *</Label>
                <FileInput
                  type="file"
                  id="pdf"
                  name="pdf"
                  accept="application/pdf"
                  onChange={handleChange}
                  required
                />
                <FileHelp>Maximum file size: 10MB. PDF format only.</FileHelp>
              </FormGroup>

              <FormGroup>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    name="confirm"
                    checked={formData.confirm}
                    onChange={handleChange}
                    required
                  />
                  <span>I confirm that this is original work and grant permission for publication</span>
                </CheckboxLabel>
              </FormGroup>

              <ButtonGroup>
                <SubmitButton type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Paper"}
                </SubmitButton>
                <ResetButton type="button" onClick={handleReset}>Clear Form</ResetButton>
              </ButtonGroup>

              {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
              <Modal
                open={modal.open}
                title={modal.title}
                message={modal.message}
                onClose={() => setModal({ open: false, title: "", message: "" })}
              />
            </form>
          </FormWrapper>
          </Main>
    </Layout>
  );
};

export default Submit;
