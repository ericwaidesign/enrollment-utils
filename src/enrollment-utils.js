var enrollmentUtils = (function () {
    const constants = {
        URL_ROOT: 'http://localhost:9000/api/',
        URL_PATH_ENROLLEES: 'enrollees/',

        ID_SELECT_FILE: 'select_file',
        ID_GET_ALL_ENROLLEES: 'get_all_enrollees',
        ID_REMOVE_ALL_ENROLLEES: 'remove_all_enrollees',

        EVENT_CHANGE: 'change',
        EVENT_CLICK: 'click',

        APPLICATION_JSON: 'application/json',
        POST: 'POST',
        GET: 'GET',
        DELETE: 'DELETE',
        JSON: 'json',
        COMMA: ',',
        CARRIAGE_RETURN: "\n",
        EMPTY_STRING: "",
    }

    const utils = {

        /**
         * @description Return true if the given object is null OR empty string OR 
         *  undefined OR "undefined", else return false.
         * @param {*} obj 
         */
        exist: function (obj) {
            return (typeof obj !== undefined ||
                null !== obj ||
                constants.EMPTY !== obj ||
                constants.UNDEFINED_STRING !== obj);
        },
        isFileReaderExist: function () {
            return window.FileReader;
        },
        readSelectedFile: function (evt) {
            try {
                if (utils.isFileReaderExist) {
                    let file = evt.target.files[0];
                    let fileReader = new FileReader();
                    fileReader.readAsText(file);
                    fileReader.onload = function (onloadEvt) {
                        console.log(onloadEvt.target.result);
                        processData.fromFile(onloadEvt.target.result);
                    }
                }
            } catch {
                // TODO
            }
        },
        getAllEnrollees: function (evt) {
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES,
                constants.GET,
                constants.EMPTY_STRING,
                constants.JSON,
                constants.EMPTY_STRING);
            XHR.makeRequest(request);
        },
        removeAllEnrollees: function (evt) {

        },
        createEventHandler: function (id, event, action) {
            document.getElementById(id).addEventListener(event, action);
        },
    } // end utils

    const processData = (function () {
        function enrollee(
            userId,
            firstName,
            lastName,
            version,
            insuranceCompany,
        ) {
            this.userId = userId;
            this.firstName = firstName;
            this.lastName = lastName;
            this.version = version;
            this.insuranceCompany = insuranceCompany;
        }

        /**
         * 
         * @param {*} attributes 
         */
        function createEnrolleeFromRowOfData(row) {
            let attributes = row.split(constants.COMMA);

            let enrolleObj = new enrollee();
            let i = 0;
            for (key in enrolleObj) {
                enrolleObj[key] = attributes[i].trim();
                i++;
            }

            return enrolleObj;
        }

        /**
         * 
         * @param {string} data - string retrieved from the File object
         */
        function processDataFromFile(data) {
            // store JSON format of the enrolle object
            let enrollees = [];

            let rowsOfText = data.split(constants.CARRIAGE_RETURN);
            for (row of rowsOfText) {
                let enrolleeObj = createEnrolleeFromRowOfData(row);
                enrollees.push(enrolleeObj);
            }
            let jsonEnrollees = JSON.stringify(enrollees);

            //
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES,
                constants.POST,
                constants.APPLICATION_JSON,
                constants.JSON,
                jsonEnrollees);
            XHR.makeRequest(request);
        }

        return {
            fromFile: processDataFromFile,
        }
    })(); // end processData

    const XHR = (function () {
        function createRequest(
            url,
            type,
            contentType,
            dataType,
            data
        ) {
            this.url = url;
            this.type = type;
            this.contentType = contentType;
            this.dataType = dataType;
            this.data = data;
        }

        /**
         * 
         * @param {*} request 
         */
        function makeRequest(request) {
            return $.ajax({
                url: request.url,
                type: request.type,
                contentType: request.contentType,
                dataType: request.dataType,
                data: request.data,

                success: function (data, textStatus, jqXHR) {
                    console.log(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            });
        }

        return {
            request: createRequest,
            makeRequest: makeRequest,
        }
    })(); // end XHR

    return {
        utils: utils,
        constants, constants,
    }
})(); // end enrollmentUtils

(function () {
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_SELECT_FILE,
        enrollmentUtils.constants.EVENT_CHANGE,
        enrollmentUtils.utils.readSelectedFile);
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_GET_ALL_ENROLLEES,
        enrollmentUtils.constants.EVENT_CLICK,
        enrollmentUtils.utils.getAllEnrollees);
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_REMOVE_ALL_ENROLLEES,
        enrollmentUtils.constants.EVENT_CLICK,
        enrollmentUtils.utils.readSelectedFile);
})();