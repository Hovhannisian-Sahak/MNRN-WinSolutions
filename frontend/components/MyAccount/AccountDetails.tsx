import React, { FC, useContext, useState } from "react";
import { Button } from "react-bootstrap";
import { Card, Form } from "react-bootstrap";
import { User } from "../../services/User.service";
import { responsePayload } from "../../services/api";
import { useRouter } from "next/router";
import { Context } from "../../context";

interface Props {
  user: Record<string, any>;
  dispatch: any;
  addToast: any;
}

const AccountDetails: FC<Props> = ({ user, dispatch, addToast }) => {
  console.log(user);
  const [accountForm, setAccountForm] = useState({
    name: user?.name,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const updateUserAccount = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const { name, oldPassword, newPassword, confirmPassword } = accountForm;
      if (!name || !oldPassword || !newPassword || !confirmPassword) {
        throw new Error("All fields are required");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      if (newPassword.length < 6) {
        throw new Error("password must be atleast 6 characters long");
      }
      const payload = {
        name,
        oldPassword,
        newPassword,
      };
      const { success, message, result }: responsePayload =
        await User.updateUser(user.id, payload);
      if (!success) {
        throw new Error(message);
      }
      dispatch({ type: "UPDATE_USER", payload: result });
      addToast(message, { appearance: "success", autoDismiss: true });
      setAccountForm({
        name: result.name,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
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
  return (
    <Card className="mt-3">
      <Card.Header>Register</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Full name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your full name"
              value={accountForm.name}
              onChange={(e) =>
                setAccountForm({ ...accountForm, name: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="name@example.com"
              disabled={true}
              value={user?.email}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Current Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your password"
              onChange={(e) =>
                setAccountForm({ ...accountForm, oldPassword: e.target.value })
              }
              value={accountForm.oldPassword}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter your new password"
              onChange={(e) =>
                setAccountForm({ ...accountForm, newPassword: e.target.value })
              }
              value={accountForm.newPassword}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
            <Form.Label>Re-type Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Re-type your password"
              onChange={(e) =>
                setAccountForm({
                  ...accountForm,
                  confirmPassword: e.target.value,
                })
              }
              value={accountForm.confirmPassword}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Button
              variant="info"
              type="submit"
              className="btnAuth"
              onClick={(e) => updateUserAccount(e)}
              disabled={isLoading}
            >
              {isLoading && (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              Update
            </Button>
          </Form.Group>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AccountDetails;
