import { render, act } from "@testing-library/react";
import React from "react";
import { StringList } from "../../src/forms/StringList";
import { fireEvent } from "@testing-library/react";
import { listToMultilineString, multilineStringToList } from "../../src/forms/StringList";

// Mock component to simulate the form component that would use StringList
class MockFormComponent extends React.Component {
