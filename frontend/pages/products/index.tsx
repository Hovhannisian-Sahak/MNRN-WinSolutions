import axios from "axios";
import { GetServerSideProps, NextPage } from "next";
import React, { useState } from "react";
import queryString from "query-string";
import { Col, DropdownButton, Dropdown, Row } from "react-bootstrap";
import BreadcrumbDisplay from "../../components/shared/BreadcrumbDisplay";
import { useRouter } from "next/router";
interface Props {
  products: Record<string, any>[];
  metadata: Record<string, any>;
}

const AllProducts: NextPage<Props> = ({ products, metadata }) => {
  const [sortText, setSortText] = useState("Sort By");
  const router = useRouter();
  return (
    <>
      <Row>
        <Col md={8}>
          <BreadcrumbDisplay
            childrens={[
              { active: false, href: "/", text: "Home" },
              {
                active: true,
                href: "",
                text: "Products",
              },
            ]}
          />
        </Col>
        <Col md={4}>
          <DropdownButton
            variant="outline-secondary"
            id="input--group-dropdown-2"
            title="Dropdown button"
            onSelect={(e) => {
              if (e) {
                setSortText(
                  e === "-avgRating"
                    ? "Rating"
                    : e === "-createdAt"
                    ? "Latest"
                    : "Sort By"
                );
                delete router.query.offset;
                router.query.sort = e;
                router.push(router);
              } else {
                delete router.query.sort;
                router.push(router);
              }
            }}
          >
            <Dropdown.Item href="#" eventKey="-avgRating">
              Rating
            </Dropdown.Item>
            <Dropdown.Item href="#" eventKey="-createdAt">
              Latest
            </Dropdown.Item>
            <Dropdown.Item href="#" eventKey="">
              Reset
            </Dropdown.Item>
          </DropdownButton>
        </Col>
      </Row>
      <Row>
        <Col sm={2}>
          <ProductFilter />
        </Col>
        <Col sm={8}></Col>
      </Row>
    </>
  );
};
export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  try {
    const url = queryString.stringifyUrl({
      url: `${
        process.env.NODE_ENV !== "production"
          ? process.env.NEXT_PUBLIC_BASE_API_URL_LOCAL
          : process.env.NEXT_PUBLIC_BASE_API_URL
      }/products`,
      query: context.query,
    });

    const res = await axios({
      method: "GET",
      url,
      headers: { cookie: context.req.headers.cookie },
    });
    console.log(res);
    return {
      props: {
        products: res?.data?.result?.products || {},
        metadata: res?.data?.result?.metadata || {},
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        products: {},
        message: "Error fetching data",
      },
    };
  }
};

export default AllProducts;
