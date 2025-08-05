import { useState } from "react";
import TestHelper from "../testConstructor/TestHelper";
import TestViewer from "./TestViewer";
const TestPreview = () => {
    const test = (() => {
        return TestHelper.getTestFromStorage();
    })();
    return <TestViewer test={test}></TestViewer>;
};
export default TestPreview;
