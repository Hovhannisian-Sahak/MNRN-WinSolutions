import React, { FC, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { Product } from "../../services/Products.services";
import { Archive, Pen } from "react-bootstrap-icons";
import SkuDetailsForm from "./SkuDetailsForm";
import { Button, Badge, Table } from "react-bootstrap";
import { getFormattedStringFromDays } from "../../utils";
import SkuDetailsLicense from "./SkuDetailsLicense";
interface Props {
  skuDetails: any;
  productId: string;
  setAllSkuDetails: any;
}

const SkuDetailsList: FC<Props> = ({
  skuDetails: allSkuDetails,
  productId,
  setAllSkuDetails,
}) => {
  console.log(allSkuDetails);
  const [allSkuDetailsFormShow, setAllSkuDetailsFormShow] =
    useState<any>(false);
  const [skuIdForUpdate, setSkuIdForUpdate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToasts();
  const [licenseFor, setLicenseFor] = useState("");
  const deleteHandler = async (skuId: string) => {
    try {
      const deleteConfirm = confirm(
        "Want to delete?You will lost all licenses for this sku"
      );
      if (deleteConfirm) {
        const deleteSkuRes = await Product.deleteSku(productId, skuId);
        if (!deleteSkuRes.success) {
          throw new Error(deleteSkuRes.message);
        }
        setAllSkuDetails(
          allSkuDetails.filter((sku: { _id: string }) => sku._id !== skuId)
        );
        addToast(deleteSkuRes.message, {
          appearance: "success",
          autoDismiss: true,
        });
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
      setIsLoading(false);
    }
  };
  return (
    <>
      {!allSkuDetailsFormShow && !licenseFor && (
        <>
          <Button
            variant="secondary"
            onClick={() => setAllSkuDetailsFormShow(true)}
          >
            Add SKU Details
          </Button>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                {/* <th>Quantity</th> */}
                <th>License Keys</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {allSkuDetails && allSkuDetails.length > 0 ? (
                allSkuDetails.map((skuDetail: any, key: any) => (
                  <tr key={key}>
                    <td>{skuDetail?.skuName}</td>
                    <td>
                      ₹{skuDetail?.price}{" "}
                      <Badge bg="warning" text="dark">
                        {skuDetail?.lifetime
                          ? "Lifetime"
                          : getFormattedStringFromDays(skuDetail?.validity)}
                      </Badge>
                    </td>
                    {/* <td>{skuDetail?.quantity}</td> */}
                    <td>
                      <Button
                        variant="link"
                        onClick={() => {
                          setLicenseFor(skuDetail?._id);
                          setAllSkuDetailsFormShow(false);
                        }}
                      >
                        View
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="outline-dark"
                        id={skuDetail._id}
                        onClick={() => {
                          setSkuIdForUpdate(skuDetail._id);
                          setAllSkuDetailsFormShow(true);
                        }}
                      >
                        <Pen />
                      </Button>{" "}
                      <Button
                        variant="outline-dark"
                        onClick={() => deleteHandler(skuDetail._id)}
                      >
                        {/* {isLoadingForDelete.status &&
                        isLoadingForDelete.id === skuDetail._id ? (
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                        ) : ( */}
                        <Archive />
                        {/* )} */}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>No SKU Details found</td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
      {allSkuDetailsFormShow && (
        <SkuDetailsForm
          setAllSkuDetailsFormShow={setAllSkuDetailsFormShow}
          setAllSkuDetails={setAllSkuDetails}
          allSkuDetails={allSkuDetails}
          productId={productId}
          skuIdForUpdate={skuIdForUpdate}
          setSkuIdForUpdate={setSkuIdForUpdate}
        />
      )}
      {licenseFor && (
        <SkuDetailsLicense
          productId={productId}
          licenseFor={licenseFor}
          setLicenseFor={setLicenseFor}
        />
      )}
    </>
  );
};

export default SkuDetailsList;
