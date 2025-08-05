import axios from "axios";
import { useState } from "react";
const useImageHook = () => {
    const [imageData, chaneImage] = useState(null);

    function uploadImage(uuid) {
        axios
            .post(`/api/tests/${uuid}/image`, imageData, {
                headers: { "Content-type": "multipart-form-data" },
            })
            .then((response) => {
                console.log(response);
            })
            .catch((error) => {
                console.error("FAILED TO LOAD IMAGE, ", error);
            });
    }
    return { chaneImage, uploadImage };
};
export default useImageHook;
