import { render, act } from "@testing-library/react";
import React from "react";
import { TimesOfDayList } from "../../src/forms/TimesOfDayList";
import { fireEvent } from "@testing-library/react";

// Mock component to simulate the form component that would use TimesOfDayList
class MockFormComponent extends React.Component {
