import React, { useEffect, useState } from "react";
import type { GetServerSideProps, NextPage } from "next";
import {
  Button,
  Card,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import { Col } from "react-bootstrap";
import { Archive, Check2Circle, Pen, Trash } from "react-bootstrap-icons";
import { Table } from "react-bootstrap";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import Link from "next/link";
import { Product } from "../../services/Product.services";
const initialForm = {
  productName: "" as string,
  description: "" as string,
  category: "" as string,
  platformType: "" as string,
  baseType: "" as string,
  productUrl: "" as string,
  downloadUrl: "" as string,
  requirementSpecification: [] as Record<string, any>[],
  highlights: [] as string[],
};
interface Props {
  product: Record<string, any>;
  productIdForUpdate: string;
}
const UpdateProduct: NextPage<Props> = ({ product, productIdForUpdate }) => {
  console.log(product);
  const { addToast } = useToasts();
  const [productForm, setProductForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [requirementName, setRequirementName] = useState("");
  const [requirementDescription, setRequirementDescription] = useState("");
  const [updateRequirementIndex, setUpdateRequirementIndex] = useState(-1);
  const [highlight, setHightlight] = useState("");
  const [updateHighlightIndex, setUpdateHighlightIndex] = useState(-1);
  const handleHightlightAdd = () => {
    if (updateHighlightIndex !== -1) {
      setProductForm({
        ...productForm,
        highlights: productForm.highlights.map((value, index) => {
          if (index === updateHighlightIndex) {
            return highlight;
          }
          return value;
        }),
      });
    } else {
      setProductForm({
        ...productForm,
        highlights: [...productForm.highlights, highlight],
      });
    }
    setHightlight("");
    setUpdateHighlightIndex(-1);
  };
  useEffect(() => {
    if (product && product.productName) {
      setProductForm({ ...initialForm, ...product });
    }
  }, [product]);

  const handleRequirementAdd = () => {
    if (updateRequirementIndex !== -1) {
      setProductForm({
        ...productForm,
        requirementSpecification: productForm.requirementSpecification.map(
          (requirement, index) => {
            if (index === updateRequirementIndex) {
              return { [requirementName]: requirementDescription };
            }
            return requirement;
          }
        ),
      });
    } else {
      setProductForm({
        ...productForm,
        requirementSpecification: [
          ...productForm.requirementSpecification,
          { [requirementName]: [requirementDescription] },
        ],
      });
    }
    setRequirementName("");
    setRequirementDescription("");
    setUpdateRequirementIndex(-1);
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      if (productIdForUpdate) {
        await Product.updateProduct(productIdForUpdate, productForm);
        addToast("Product Updated Successfully", {
          appearance: "success",
          autoDismiss: true,
        });
      } else {
        await Product.createProduct(productForm);
        addToast("Product Created Successfully", {
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
      addToast(error.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Card
        className="updateProductCard"
        style={{ padding: "15px", marginTop: "20px" }}
      >
        <Row>
          <h4 className="text-center productFormHeading">
            Product Details Form
          </h4>
          <hr />
          <Col>
            <Form>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Product Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Product Name"
                  value={productForm.productName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProductForm({
                      ...productForm,
                      productName: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>Product Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Enter Product Description"
                  value={productForm.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setProductForm({
                      ...productForm,
                      description: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Product Requirements</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter Requirement Name"
                    value={requirementName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRequirementName(e.target.value)
                    }
                  />
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Enter Requirement Description"
                    value={requirementDescription}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setRequirementDescription(e.target.value)
                    }
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleRequirementAdd}
                  >
                    <Check2Circle />
                  </Button>
                </InputGroup>
              </Form.Group>

              <p style={{ color: "#10557a" }}>Requirements are listed here:</p>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {productForm.requirementSpecification.length > 0 ? (
                    productForm.requirementSpecification.map((item, index) => (
                      <tr key={index}>
                        <td>{Object.keys(item)[0]}</td>
                        <td>{Object.values(item)[0]}</td>
                        <td>
                          <Button
                            variant="secondary"
                            size="sm"
                            style={{ marginRight: "4px" }}
                            onClick={() => {
                              setUpdateRequirementIndex(index);
                              setRequirementName(Object.keys(item)[0]);
                              setRequirementDescription(Object.values(item)[0]);
                            }}
                          >
                            <Pen />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              const newRequireSpecification =
                                productForm.requirementSpecification.filter(
                                  (item, i) => i !== index
                                );
                              setProductForm({
                                ...productForm,
                                requirementSpecification:
                                  newRequireSpecification,
                              });
                            }}
                          >
                            <Trash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No Requirements
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Form>
          </Col>
          <Col>
            <Form>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Product Category</Form.Label>
                <Form.Select
                  aria-label="Default select example"
                  value={productForm.category}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = event.target.value;
                    setProductForm({
                      ...productForm,
                      category: value as string,
                    });
                  }}
                >
                  <option value="">Choose the category</option>
                  <option value="Operating System">Operating System</option>
                  <option value="Application Software">
                    Application Software
                  </option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Platform Type</Form.Label>
                <Form.Select
                  aria-label="Default select example"
                  value={productForm.platformType}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = event.target.value;
                    setProductForm({
                      ...productForm,
                      platformType: value as string,
                    });
                  }}
                >
                  <option value="">Choose the platform type</option>
                  <option value="Windows">Windows</option>
                  <option value="Android">iOS</option>
                  <option value="Linux">Linux</option>
                  <option value="Mac">Mac</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formBasicPassword">
                <Form.Label>Base Type</Form.Label>
                <Form.Select
                  aria-label="Default select example"
                  value={productForm.baseType}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
                    const value = event.target.value;
                    setProductForm({
                      ...productForm,
                      baseType: value as string,
                    });
                  }}
                >
                  <option>Choose the base type</option>
                  <option value="Computer">Computer</option>
                  <option value="Mobile">Mobile</option>
                </Form.Select>
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Product URL</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Product URL"
                  value={productForm.productUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    setProductForm({
                      ...productForm,
                      productUrl: value as string,
                    });
                  }}
                />
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Product Download URL</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Product Download URL"
                  value={productForm.downloadUrl}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    const value = event.target.value;
                    setProductForm({
                      ...productForm,
                      downloadUrl: value as string,
                    });
                  }}
                />
              </Form.Group>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Product Highlights</Form.Label>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Enter Product Highlight"
                    value={highlight}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setHightlight(event.target.value);
                    }}
                  />
                  <Button variant="secondary" onClick={handleHightlightAdd}>
                    <Check2Circle />
                  </Button>
                </InputGroup>
              </Form.Group>
              <p style={{ color: "#10557a" }}>
                Product highlights are listed below:
              </p>
              <ListGroup>
                {productForm.highlights.length > 0 ? (
                  productForm.highlights.map((highlight, index) => (
                    <ListGroup.Item key={index}>
                      {highlight}
                      <Button
                        variant="secondary"
                        style={{ float: "right" }}
                        onClick={() => {
                          setHightlight(highlight);
                          setUpdateHighlightIndex(index);
                        }}
                      >
                        <Pen />
                      </Button>
                      <Button
                        variant="danger"
                        style={{ float: "right" }}
                        onClick={() => {
                          const highlights = productForm.highlights;
                          highlights.splice(index, 1);
                          setProductForm({ ...productForm, highlights });
                        }}
                      >
                        <Trash />
                      </Button>
                    </ListGroup.Item>
                  ))
                ) : (
                  <ListGroup.Item className="text-center">
                    No Highlights
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Form>
          </Col>
        </Row>
        <br />
        <Row>
          <Col style={{ textAlign: "end" }}>
            <Link href={`/products`}>
              <Button variant="secondary">Back</Button>
            </Link>{" "}
            <Button
              variant="info"
              onClick={(
                event: React.MouseEvent<HTMLButtonElement, MouseEvent>
              ) => {
                event.preventDefault();
                setProductForm(initialForm);
              }}
            >
              Cancel
            </Button>{" "}
            <Button
              variant="primary"
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
          </Col>{" "}
        </Row>
      </Card>
    </>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    if (!context.query?.productId) {
      console.log(context.query);
      return {
        props: {
          product: {},
          productIdForUpdate: "",
        },
      };
    }
    const res = await axios({
      method: "GET",
      url:
        `${
          process.env.NODE_ENV !== "production"
            ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
            : process.env.NEXT_PUBLIC_BASE_API_URL
        }/products/` + context.query?.productId,
      headers: { cookie: context.req.headers.cookie },
    });
    console.log(res);
    console.log(context.query.productId);
    console.log(
      `${
        process.env.NODE_ENV !== "production"
          ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
          : process.env.NEXT_PUBLIC_BASE_API_URL
      }/products/` + context.query?.productId
    );
    return {
      props: {
        product: res?.data?.result?.product || {},
        productIdForUpdate: (context.query?.productId as string) || "",
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        product: {},
        productIdForUpdate: "",
      },
    };
  }
};
export default UpdateProduct;
