import { toString } from "lodash";
import React, { useState, useEffect, useMemo } from "react";
import cx from "classnames";
import Popover from "antd/lib/popover";
import Card from "antd/lib/card";
import Tooltip from "antd/lib/tooltip";
import chooseTextColorForBackground from "@/lib/chooseTextColorForBackground";

import CloseOutlinedIcon from "@ant-design/icons/CloseOutlined";
import CheckOutlinedIcon from "@ant-design/icons/CheckOutlined";

import ColorInput from "./Input";
import Swatch from "./Swatch";
import Label from "./Label";
import { validateColor } from "./utils";

import "./index.less";

type OwnProps = {
  color?: string;
  placement?:
    | "top"
    | "left"
    | "right"
    | "bottom"
    | "topLeft"
    | "topRight"
    | "bottomLeft"
    | "bottomRight"
    | "leftTop"
    | "leftBottom"
    | "rightTop"
    | "rightBottom";
  presetColors?:
    | string[]
    | {
        [key: string]: string;
      };
  presetColumns?: number;
  interactive?: boolean;
  triggerProps?: any;
  children?: React.ReactNode;
  addonBefore?: React.ReactNode;
  addonAfter?: React.ReactNode;
  onChange?: (...args: any[]) => any;
};

export default function ColorPicker({
  color,
  placement,
  presetColors,
  presetColumns,
  interactive,
  children,
  onChange,
  triggerProps,
  addonBefore,
  addonAfter,
}: Props) {
  const [visible, setVisible] = useState(false);
  const validatedColor = useMemo(() => validateColor(color), [color]);
  const [currentColor, setCurrentColor] = useState("");

  function handleApply() {
    setVisible(false);
    if (!interactive) {
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
      onChange(currentColor);
    }
  }

  function handleCancel() {
    setVisible(false);
  }

  const actions = [];
  if (!interactive) {
    actions.push(
      <Tooltip key="cancel" title="Cancel">
        <CloseOutlinedIcon onClick={handleCancel} />
      </Tooltip>
    );
    actions.push(
      <Tooltip key="apply" title="Apply">
        <CheckOutlinedIcon onClick={handleApply} />
      </Tooltip>
    );
  }

  function handleInputChange(newColor: any) {
    setCurrentColor(newColor);
    if (interactive) {
      // @ts-expect-error ts-migrate(2349) FIXME: This expression is not callable.
      onChange(newColor);
    }
  }

  useEffect(() => {
    if (visible) {
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | null' is not assignable... Remove this comment to see the full error message
      setCurrentColor(validatedColor);
    }
  }, [validatedColor, visible]);

  return (
    <span className="color-picker-wrapper">
      {addonBefore}
      <Popover
        arrowPointAtCenter
        overlayClassName={`color-picker ${interactive ? "color-picker-interactive" : "color-picker-with-actions"}`}
        // @ts-expect-error ts-migrate(2322) FIXME: Type '{ "--color-picker-selected-color": string; }... Remove this comment to see the full error message
        overlayStyle={{ "--color-picker-selected-color": currentColor }}
        content={
          <Card
            data-test="ColorPicker"
            className="color-picker-panel"
            bordered={false}
            title={toString(currentColor).toUpperCase()}
            headStyle={{
              backgroundColor: currentColor,
              // @ts-expect-error ts-migrate(2322) FIXME: Type 'string | null | undefined' is not assignable... Remove this comment to see the full error message
              color: chooseTextColorForBackground(currentColor),
            }}
            actions={actions}>
            <ColorInput
              color={currentColor}
              presetColors={presetColors}
              presetColumns={presetColumns}
              onChange={handleInputChange}
              onPressEnter={handleApply}
            />
          </Card>
        }
        trigger="click"
        placement={placement}
        visible={visible}
        onVisibleChange={setVisible}>
        {children as any || (
          <Swatch
            color={validatedColor}
            size={30}
            {...triggerProps as any}
            className={cx("color-picker-trigger", triggerProps.className)}
          />
        )}
      </Popover>
      {addonAfter}
    </span>
  );
}

ColorPicker.defaultProps = {
  color: "#FFFFFF",
  placement: "top" as const,
  presetColumns: 8,
  interactive: false,
  triggerProps: {},
  children: null,
  addonBefore: null,
  addonAfter: null,
  onChange: () => {},
} as Props;

type Props = OwnProps;

ColorPicker.Input = ColorInput;
ColorPicker.Swatch = Swatch;
ColorPicker.Label = Label;
