import TestsGridRenderer from "../layout/TestsGridRenderer";
const ModeratedTests = () => {
    return (
        <div className="text-center">
            <h3>Список тестов на модерации</h3>
            <TestsGridRenderer
                endpointPrefix={"tests"}
                loadListEndPoint={"/api/moderated/tests/"}
            ></TestsGridRenderer>
        </div>
    );
};
export default ModeratedTests;
