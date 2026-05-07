import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { API_URL } from "../../server/API/Auth";
import Modal from "./Common/Modal.jsx";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, title: "", message: "", onClose: null });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.password || !formData.confirmPassword) {
      setModal({
        open: true,
        title: "Reset Failed",
        message: "Please fill in both password fields.",
        onClose: null
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setModal({
        open: true,
        title: "Reset Failed",
        message: "Passwords do not match.",
        onClose: null
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: formData.password })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "Password reset failed");
      }

      setModal({
        open: true,
        title: "Password Reset Successful",
        message: result.message || "Your password has been updated successfully.",
        onClose: () => navigate("/login")
      });
    } catch (err) {
      console.error(err);
      setModal({
        open: true,
        title: "Password Reset Failed",
        message: err.message || "Unable to reset password.",
        onClose: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    const onClose = modal.onClose;
    setModal({ open: false, title: "", message: "", onClose: null });
    onClose?.();
  };

  return (
    <Wrapper>
      <Container>
        <HeaderSection>
          <h1>Create New Password</h1>
          <p>Enter your new password below to finish resetting your account.</p>
        </HeaderSection>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>New Password *</Label>
            <Input
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Confirm Password *</Label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </FormGroup>

          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </SubmitButton>

          <BackLink type="button" onClick={() => navigate("/login")}>
            Back to Login
          </BackLink>
        </form>

        <Modal
          open={modal.open}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
        />
      </Container>
    </Wrapper>
  );
};

export default ResetPassword;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Container = styled.div`
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  width: 100%;
  max-width: 450px;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 32px;
    font-weight: 800;
    color: white;
    margin: 0 0 12px 0;
    letter-spacing: 1px;
  }

  p {
    font-size: 14px;
    color: #cbd5e1;
    margin: 0;
    line-height: 1.6;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 25px;
`;

const Label = styled.label`
  color: white;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  height: 48px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.3);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;

  &::placeholder {
    color: #94a3b8;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  margin-top: 10px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
  }

  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
  }
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #7dd3fc;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    color: #667eea;
  }
`;
