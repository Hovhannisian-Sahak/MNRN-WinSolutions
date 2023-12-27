import React, { FC } from "react";
import { Breadcrumb } from "react-bootstrap";

interface children {
  active: boolean;
  href: string;
  text: string;
}
interface Props {
  childrens?: children[];
}

const BreadcrumbDisplay: FC<Props> = ({ childrens }) => {
  return (
    <Breadcrumb style={{ marginTop: "10px" }}>
      {childrens &&
        childrens.map((child) => {
          return (
            <Breadcrumb.Item
              key={child.text}
              active={child.active}
              href={child.href}
            >
              {child.text}
            </Breadcrumb.Item>
          );
        })}
    </Breadcrumb>
  );
};

export default BreadcrumbDisplay;
