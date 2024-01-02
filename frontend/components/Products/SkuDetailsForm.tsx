import React, { FC, useEffect, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import { getFormattedStringFromDays } from "../../utils";
import { Product } from "../../services/Product.services";
const initialState = {
  skuName: "",
  price: 0,
  validity: 0,
  validityType: "months",
  lifetime: false,
};
interface Props {
  setAllSkuDetailsFormShow: any;
  productId: string;
  allSkuDetails: any;
  setAllSkuDetails: any;
  skuIdForUpdate: string;
  setSkuIdForUpdate: any;
}
const SkuDetailsForm: FC<Props> = ({
  setAllSkuDetailsFormShow,
  productId,
  allSkuDetails,
  setAllSkuDetails,
  skuIdForUpdate,
  setSkuIdForUpdate,
}) => {
  console.log(skuIdForUpdate);
  const { addToast } = useToasts();
  const [isLoading, setIsLoading] = useState(false);
  const [skuForm, setSkuForm] = useState(initialState);
  useEffect(() => {
    if (skuIdForUpdate) {
      const skuDetail = allSkuDetails.find(
        (sku: { _id: string }) => sku._id === skuIdForUpdate
      );
      if (skuDetail) {
        const validityTime = getFormattedStringFromDays(skuDetail.validity);
        setSkuForm({
          ...initialState,
          ...skuDetail,
          validity: validityTime.split(" ")[0] || 0,
          validityType: validityTime.split(" ")[1] || "months",
        });
      }
    }
  }, [allSkuDetails, skuIdForUpdate]);
  const handleCancel = () => {
    setAllSkuDetailsFormShow(false);
    setSkuForm(initialState);
    setSkuIdForUpdate("");
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { skuName, price, validity, lifetime } = skuForm;
      if (!skuName || !price) {
        throw new Error("Invalid data");
      }
      if (!validity && !lifetime) {
        throw new Error("Validity or Lifetime is required.");
      }
      if (!lifetime) {
        skuForm.validity =
          skuForm.validityType === "months"
            ? skuForm.validity * 30
            : skuForm.validity * 365;
      } else {
        skuForm.validity = Number.MAX_SAFE_INTEGER;
      }
      console.log("Before if:", skuIdForUpdate);
      const res =
        skuIdForUpdate === ""
          ? await Product.createSku(productId, { skuDetails: [skuForm] })
          : await Product.updateSku(productId, skuIdForUpdate, skuForm);
      console.log(allSkuDetails);
      console.log("After if:", skuIdForUpdate);
      console.log("After if:", res);
      if (!res.success) {
        throw new Error(res.message);
      }
      setAllSkuDetailsFormShow(false);
      setSkuIdForUpdate("");
      console.log(res?.result?.skuDetails);
      setAllSkuDetails(res?.result?.skuDetails);

      console.log(allSkuDetails);
      addToast(res.message, {
        appearance: "success",
        autoDismiss: true,
      });

      console.log(res);
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
    <Card style={{ padding: "10px" }}>
      <h6 style={{ color: "green" }}>SKU information ::</h6>
      <Form>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>SKU Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter SKU Name"
            value={skuForm.skuName}
            onChange={(e) =>
              setSkuForm({ ...skuForm, skuName: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>SKU Price For Each License</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter SKU Price"
            value={skuForm.price}
            onChange={(e) =>
              setSkuForm({ ...skuForm, price: parseFloat(e.target.value) })
            }
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>SKU Validity</Form.Label>{" "}
          <small style={{ color: "grey" }}>
            (If validity is lifetime then check the box)
            <Form.Check
              type="switch"
              id="custom-switch"
              label="Lifetime"
              checked={skuForm.lifetime}
              onChange={(e) =>
                e.target.checked
                  ? setSkuForm({
                      ...skuForm,
                      lifetime: e.target.checked,
                      validity: 0,
                      validityType: "Select Type",
                    })
                  : setSkuForm({
                      ...skuForm,
                      validity: 0,
                      lifetime: e.target.checked,
                      validityType: "Select Type",
                    })
              }
            />
          </small>
          <InputGroup className="mb-3">
            <Form.Control
              aria-label="Text input with checkbox"
              disabled={skuForm.lifetime}
              type="number"
              value={skuForm.validity}
              onChange={(e) =>
                setSkuForm({ ...skuForm, validity: parseInt(e.target.value) })
              }
            />
            <DropdownButton
              variant="outline-secondary"
              title={skuForm.validityType}
              id="input-group-dropdown-9"
              disabled={skuForm.lifetime}
              align="end"
              onSelect={(e) =>
                setSkuForm({
                  ...skuForm,
                  validityType: e || "",
                })
              }
            >
              <Dropdown.Item href="#" eventKey={"months"}>
                Months
              </Dropdown.Item>
              <Dropdown.Item href="#" eventKey={"years"}>
                Years
              </Dropdown.Item>
            </DropdownButton>
          </InputGroup>
        </Form.Group>

        <div style={{ marginTop: "10px" }}>
          <Button variant="outline-info" onClick={handleCancel}>
            Cancel
          </Button>{" "}
          <Button
            variant="outline-primary"
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading && (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
            )}
            Submit
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SkuDetailsForm;
