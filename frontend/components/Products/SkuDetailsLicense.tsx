import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  InputGroup,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import { Product } from "../../services/Products.services";
import {
  Archive,
  ArrowLeft,
  Check2Circle,
  Pen,
  Plus,
} from "react-bootstrap-icons";

interface Props {
  productId: string;
  licenseFor: string;
  setLicenseFor: any;
}

const SkuDetailsLicense: FC<Props> = ({
  productId,
  licenseFor,
  setLicenseFor,
}) => {
  useEffect(() => {
    setLicenses([]);
    setLicenseKey("");
    setAddFormShow(false);
    setLicenseIdForUpdate("");
  }, []);
  useEffect(() => {
    if (licenseFor) {
      fetchAllLicenses(productId, licenseFor);
    }
  }, [licenseFor]);
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const [addFormShow, setAddFormShow] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseIdForUpdate, setLicenseIdForUpdate] = useState("");
  const [licenses, setLicenses] = useState([]);
  const [isLoadingForDelete, setIsLoadingForDelete] = useState({
    status: false,
    id: "",
  });
  const [isLoadingFetch, setIsLoadingFetch] = useState(false);
  const fetchAllLicenses = async (productId: string, skuId: string) => {
    try {
      setIsLoadingFetch(true);
      const res = await Product.getSkuLicenses(productId, skuId);
      if (!res.success) {
        throw new Error(res.message);
      }
      setLicenses(res?.result);
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
  const updateLicenseKey = async (e: any) => {
    try {
      e.preventDefault();
      setIsLoading(true);
      const res = licenseIdForUpdate
        ? await Product.updateLicense(
            productId,
            licenseFor,
            licenseIdForUpdate,
            { licenseKey }
          )
        : await Product.createLicense(productId, licenseFor, {
            licenseKey,
          });
      if (!res.success) {
        throw new Error(res.message);
      }
      setLicenseKey("");
      setAddFormShow(false);
      await fetchAllLicenses(productId, licenseFor);
      addToast(res.message, { appearance: "success", autoDismiss: true });
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
  const addLicense = () => {};
  const deleteLicense = async (id: string) => {
    try {
      const deleteConfirm = confirm(
        "Want to delete?You will lost all licenses for this sku"
      );
      if (deleteConfirm) {
        setIsLoadingForDelete({
          status: true,
          id,
        });
        const res = await Product.deleteLicense(id);
        if (!res.success) {
          throw new Error(res.message);
        }
        await fetchAllLicenses(productId, licenseFor);
        addToast(res.message, { appearance: "success", autoDismiss: true });
      }
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
      setIsLoadingForDelete({ status: false, id: "" });
    }
  };
  return (
    <Card style={{ padding: "10px" }}>
      <Button
        variant="info"
        className="btnBackLicense"
        style={{ width: "fit-content", margin: "3px" }}
        onClick={() => setLicenseFor("")}
      >
        <ArrowLeft />
      </Button>
      <Button
        variant="secondary"
        className="btnAddLicense"
        onClick={() => {
          setAddFormShow(true);
          setLicenseKey("");
        }}
        style={{ width: "fit-content", margin: "3px" }}
      >
        <Plus />
        Add New
      </Button>
      {addFormShow && (
        <Form>
          <h6 style={{ color: "green" }}>
            License Keys Information ({licenses.length})::
          </h6>
          <Form.Group controlId="formBasicPassword">
            <Form.Label>SKU License Keys</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                type="text"
                placeholder="Enter License Key"
                onChange={(e) => setLicenseKey(e.target.value)}
                value={licenseKey}
              />
              <Button
                variant="secondary"
                onClick={addLicense}
                disabled={isLoading}
              >
                {isLoading && (
                  <span
                    className="spinner-border spinner-border-sm mr-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                <Check2Circle /> Submit
              </Button>
            </InputGroup>
          </Form.Group>
        </Form>
      )}
      <div>License Keys are listed below ({licenses.length})</div>

      {licenses.length > 0 ? (
        licenses.map((license: any, index: number) => (
          <ListGroup.Item key={index}>
            <Badge bg="info">{license.licenseKey}</Badge>
            <span
              className="editLBtn"
              onClick={() => {
                setLicenseIdForUpdate(license._id);
                setLicenseKey(license.licenseKey);
                setAddFormShow(true);
              }}
            >
              <Pen />
            </span>
            <span className="delBtn">
              {isLoadingForDelete.status &&
              isLoadingForDelete.id === license._id ? (
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                <Archive />
              )}
            </span>
          </ListGroup.Item>
        ))
      ) : (
        <ListGroup.Item>
          <span>
            {isLoadingFetch ? (
              <>
                <span
                  className="spinner-border spinner-border-sm mr-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Loading...</span>
              </>
            ) : (
              "No license keys found"
            )}
          </span>
        </ListGroup.Item>
      )}
    </Card>
  );
};

export default SkuDetailsLicense;
