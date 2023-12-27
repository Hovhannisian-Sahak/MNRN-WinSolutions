import React, { FC, useContext, useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import { useToasts } from "react-toast-notifications";
import validator from "validator";
import { User } from "../../services/User.service";
import { useRouter } from "next/router";
import { Context } from "../../context";
import { responsePayload } from "../../services/api";
interface Props {
  isRegisterForm?: boolean;
}
const initialForm = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
};
const RegisterLogin: FC<Props> = ({ isRegisterForm = false }) => {
  const [authForm, setAuthForm] = React.useState(initialForm);
  const [otpForm, setOtpForm] = useState({ otp: "", email: "" });
  const [otpTime, setOtpTime] = React.useState(false);
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const {
    state: { user },
    dispatch,
  } = useContext(Context);

  useEffect(() => {
    if (user && user.email) {
      router.push("/my-account");
    }
  }, [router, user]);
  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { email, name, password, confirmPassword } = authForm;
      if (!name || !email || !password || !confirmPassword) {
        throw new Error("All fields are required");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (password.length < 6) {
        throw new Error("password must be atleast 6 characters long");
      }
      if (!validator.isEmail(email)) {
        throw new Error("Please enter a valid email address");
      }
      const payload = {
        email,
        name,
        password,
        type: "customer",
      };
      const { success, message } = await User.createUsers(payload);
      if (success) {
        setAuthForm(initialForm);
        setOtpForm({ otp: "", email: payload.email });
        setOtpTime(true);
        return addToast(message, { appearance: "success" });
      }
      throw new Error(message || "something went wrong");
    } catch (error: any) {
      if (error.response) {
        return addToast(error.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }

      return addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { email, password } = authForm;
      if (!password || !email) {
        throw new Error("Please fill all the fields");
      }
      if (!validator.isEmail(email)) {
        throw new Error("Please provide valid email");
      }
      const payload = {
        email,
        password,
      };
      const { success, message, result }: responsePayload =
        await User.loginUser(payload);
      if (success) {
        setAuthForm(initialForm);
        localStorage.setItem("_user", JSON.stringify(result?.user));
        dispatch({
          type: "LOGIN",
          payload: result?.user,
        });
        return addToast(message, { appearance: "success" });
      }
      throw new Error(message || "Something went wrong");
    } catch (error: any) {
      if (error.response) {
        return addToast(error.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      return addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const otpResend = async () => {
    try {
      const { email } = otpForm;
      console.log(email);
      if (!email) {
        throw new Error("Please enter your email address");
      }
      if (!validator.isEmail(email)) {
        throw new Error("Please enter a valid email address");
      }
      setIsLoading(true);
      const { success, message } = await User.resendOtp(email);
      console.log(success, message);
      if (success) {
        setOtpTime(true);
        return addToast(message, { appearance: "success" });
      }
      throw new Error(message || "Something went wrong");
    } catch (error: any) {
      if (error.response) {
        return addToast(error.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      return addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  const verifyOtp = async (e: any) => {
    try {
      const { otp, email } = otpForm;
      if (!otp || !email) {
        throw new Error("Fields cannot be empty");
      }
      const { success, message } = await User.verifyOtp(otp, email);
      if (success) {
        setOtpTime(false);
        setOtpForm({ otp: "", email: "" });
        return addToast(message, { appearance: "success" });
      }
      throw new Error(message || "Something went wrong");
    } catch (error: any) {
      if (error.response) {
        return addToast(error.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      }
      return addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };
  return (
    <Card>
      <Card.Header>{isRegisterForm ? "Register" : "Login"}</Card.Header>
      <Card.Body>
        {isRegisterForm && (
          <Form.Group className="mb-3">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={authForm.name || ""}
              onChange={(e) =>
                setAuthForm({ ...authForm, name: e.target.value })
              }
            />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="name@example.com"
            name="email"
            value={authForm.email || otpForm.email}
            onChange={(e) =>
              setAuthForm({ ...authForm, email: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter your password"
            value={authForm.password || ""}
            onChange={(e) =>
              setAuthForm({ ...authForm, password: e.target.value })
            }
          />
        </Form.Group>
        {isRegisterForm && (
          <Form.Group className="mb-3">
            <Form.Label>Re-type password</Form.Label>
            <Form.Control
              type="password"
              name="repassword"
              placeholder="Re-type your password"
              value={authForm.confirmPassword || ""}
              onChange={(e) =>
                setAuthForm({
                  ...authForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </Form.Group>
        )}
        {otpTime && (
          <Form.Group className="mb-3">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              type="text"
              name="otp"
              placeholder="OTP"
              onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
            />
            <Button variant="link" className="resendOtpBtn" onClick={otpResend}>
              Resend OTP
            </Button>
          </Form.Group>
        )}
        {otpTime ? (
          <Button
            onClick={(e) => verifyOtp(e)}
            className="btnAuth"
            variant="info"
          >
            Verify
          </Button>
        ) : (
          <Button
            onClick={(e) =>
              isRegisterForm ? handleRegister(e) : handleLogin(e)
            }
            className="btnAuth"
            variant="info"
          >
            {isRegisterForm ? "Register" : "Login"}
          </Button>
        )}

        {!isRegisterForm && (
          <a style={{ textDecoration: "none" }} href="/forgot-password">
            Forgot your password ?
          </a>
        )}
      </Card.Body>
    </Card>
  );
};

export default RegisterLogin;
