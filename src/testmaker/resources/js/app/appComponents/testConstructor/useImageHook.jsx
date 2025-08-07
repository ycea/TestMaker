import axios from "axios";
import { useState } from "react";
const useImageHook = () => {
    const [imageData, changeImage] = useState(null);

    function uploadImage(uuid) {
        if (imageData != null) {
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
    }
    return { changeImage, uploadImage };
};
export default useImageHook;
