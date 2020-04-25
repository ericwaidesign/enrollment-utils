'use strict'

var enrollmentUtils = (function () {
    const constants = {
        URL_ROOT: 'http://localhost:9000/api/',
        URL_PATH_ENROLLEES: 'enrollees/',
        URL_INSURANCE_COMPANIES: 'insuranceCompanies/',
        URL_INSURANCE_COMPANY: 'insuranceCompany/',

        ID_SELECT_FILE: 'select_file',
        ID_GET_ALL_ENROLLEES: 'get_all_enrollees',
        ID_REMOVE_ALL_ENROLLEES: 'remove_all_enrollees',
        ID_LINKS: 'links',

        HTML_ARCHOR: 'a',
        HTML_DIR: 'dir',
        ATTRIBUTE_STYLE: 'style',
        ATTRIBUTE_CLASS: 'class',
        ATTRIBUTE_HREF: 'href',
        ATTRIBUTE_DOWNLOAD: 'download',
        ATTRIBUTE_ROLE: 'role',
        ATTRIBUTE_ARIA_PRESSED: 'aria-pressed',
        ATTRIBUTE_VALUE: 'value',
        CSV_HEADER: 'data:text/csv;charset=utf-8,',
        CSV_EXTENSION: '.csv',

        BOOTSTRAP_CSS_LINK: 'btn btn-secondary btn-sm',

        EVENT_CHANGE: 'change',
        EVENT_CLICK: 'click',

        APPLICATION_JSON: 'application/json',
        POST: 'POST',
        GET: 'GET',
        DELETE: 'DELETE',
        JSON: 'json',
        COMMA: ',',
        CARRIAGE_RETURN: '\n',
        EMPTY_STRING: '',
        NAME: 'name',
        UNDERSCORE: '_',
        BUTTON: 'button',
        TRUE: 'true',

        USER_ID: 'userId',
        FIRST_NAME: 'firstName',
        LAST_NAME: 'lastName',
        VERSION: 'version',
        INSURANCE_COMPANY: 'insuranceCompany',
    }

    const utils = {
        exist: function (obj) {
            return (typeof obj !== undefined ||
                null !== obj ||
                constants.EMPTY !== obj ||
                constants.UNDEFINED_STRING !== obj);
        },
        isFileReaderExist: function () {
            return window.FileReader;
        },
        createTimeForFileName: function () {
            let dateStr = new Date().toISOString();
            return dateStr.replace(/[-:.]/g, constants.EMPTY_STRING);
        },
        createEventHandler: function (id, event, action) {
            document.getElementById(id).addEventListener(event, action);
        },
        createCsvFileLinkElement: function (fileName, formatedCsv) {
            fileName = fileName + constants.UNDERSCORE + utils.createTimeForFileName() + constants.CSV_EXTENSION;
            formatedCsv = constants.CSV_HEADER + formatedCsv;

            let data = encodeURI(formatedCsv);
            let linkElement = document.createElement(constants.HTML_ARCHOR);
            linkElement.setAttribute(constants.ATTRIBUTE_HREF, data);
            linkElement.setAttribute(constants.ATTRIBUTE_DOWNLOAD, fileName);
            linkElement.setAttribute(constants.ATTRIBUTE_CLASS, constants.BOOTSTRAP_CSS_LINK);
            linkElement.setAttribute(constants.ATTRIBUTE_ROLE, constants.BUTTON);
            // linkElement.setAttribute(constants.ATTRIBUTE_ARIA_PRESSED, constants.TRUE);
            linkElement.innerHTML = fileName;

            return linkElement;
        },
        enrollee: function (
            userId,
            firstName,
            lastName,
            version,
            insuranceCompany,
        ) {
            this[constants.USER_ID] = userId;
            this[constants.FIRST_NAME] = firstName;
            this[constants.LAST_NAME] = lastName;
            this[constants.VERSION] = version;
            this[constants.INSURANCE_COMPANY] = insuranceCompany;
        }
    } // end utils

    const processData = (function () {

        function createEnrolleeFromRowOfData(row) {
            let attributes = row.split(constants.COMMA);

            let enrolleObj = new utils.enrollee();
            let i = 0;
            for (let key in enrolleObj) {
                enrolleObj[key] = attributes[i].trim();
                i++;
            }

            return enrolleObj;
        }

        function convertEnrolleesToCsvFormat(enrollees) {
            let str = constants.EMPTY_STRING;
            for (let enrollee of enrollees) {
                str += convertEnrolleeToCsvFormat(enrollee);
            }
            return str;
        }

        function convertEnrolleeToCsvFormat(enrollee) {
            let str = constants.EMPTY_STRING;
            str += enrollee[constants.USER_ID] + constants.COMMA;
            str += enrollee[constants.FIRST_NAME] + constants.COMMA;
            str += enrollee[constants.LAST_NAME] + constants.COMMA;
            str += enrollee[constants.VERSION] + constants.COMMA;
            str += enrollee[constants.INSURANCE_COMPANY] + constants.COMMA;
            str += constants.CARRIAGE_RETURN;
            return str;
        }

        function processDataToFile(enrollees) {
            let csv = convertEnrolleesToCsvFormat(enrollees);
            let insuranceCompanyName = enrollees[0][constants.INSURANCE_COMPANY];
            let linkElement = utils.createCsvFileLinkElement(insuranceCompanyName.trim(), csv);
            let linksElement = document.getElementById(constants.ID_LINKS);
            linksElement.appendChild(linkElement);
            linkElement.click();
        }

        function processDataFromFile(data) {
            let enrollees = [];

            let rowsOfText = data.split(constants.CARRIAGE_RETURN);
            for (let row of rowsOfText) {
                let enrolleeObj = createEnrolleeFromRowOfData(row);
                enrollees.push(enrolleeObj);
            }
            let jsonEnrollees = JSON.stringify(enrollees);

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
            toFile: processDataToFile,
            convertDataToCsvFormat: convertEnrolleesToCsvFormat,
        }
    })(); // end processData

    const service = {
        getAllInsuranceCompanies: function () {
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES + constants.URL_INSURANCE_COMPANIES,
                constants.GET,
                constants.EMPTY_STRING,
                constants.JSON,
                constants.EMPTY_STRING);
            return XHR.makeRequest(request);
        },
        getEnrolleesByInsuranceCompany: function (insuranceCompany) {
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES + constants.URL_INSURANCE_COMPANY + insuranceCompany,
                constants.GET,
                constants.APPLICATION_JSON,
                constants.EMPTY_STRING,
                constants.EMPTY_STRING);
            return XHR.makeRequest(request);
        },
        exportAllEnrollees: function () {
            // get a list of insurance companies
            service.getAllInsuranceCompanies()
                .done(function (insuranceCompanies, textStatus, jqXHR) {

                    for (let insuranceCompany of insuranceCompanies) {
                        // get a list of enrollees for the given insurance company
                        service.getEnrolleesByInsuranceCompany(insuranceCompany)
                            .done(function (enrollees, textStatus, jqXHR) {
                                processData.toFile(enrollees);
                            });
                    }
                });
        },
        getAllEnrollees: function (evt) {
            service.getAllInsuranceCompanies();
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES,
                constants.GET,
                constants.EMPTY_STRING,
                constants.JSON,
                constants.EMPTY_STRING);
            return XHR.makeRequest(request);
        },
        readSelectedFile: function (evt) {
            if (utils.isFileReaderExist) {
                let file = evt.target.files[0];
                let fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = function (onloadEvt) {
                    console.log(onloadEvt.target.result);
                    processData.fromFile(onloadEvt.target.result);
                }
            }
        },
        removeAllEnrollees: function (evt) {
            let request = new XHR.request(
                constants.URL_ROOT + constants.URL_PATH_ENROLLEES,
                constants.DELETE,
                constants.EMPTY_STRING,
                constants.EMPTY_STRING,
                constants.EMPTY_STRING);
            XHR.makeRequest(request);
        }
    }; // end service

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
        constants: constants,
        utils: utils,
        service: service,
    }
})(); // end enrollmentUtils

(function () {
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_SELECT_FILE,
        enrollmentUtils.constants.EVENT_CHANGE,
        enrollmentUtils.service.readSelectedFile);
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_GET_ALL_ENROLLEES,
        enrollmentUtils.constants.EVENT_CLICK,
        enrollmentUtils.service.exportAllEnrollees);
    enrollmentUtils.utils.createEventHandler(
        enrollmentUtils.constants.ID_REMOVE_ALL_ENROLLEES,
        enrollmentUtils.constants.EVENT_CLICK,
        enrollmentUtils.service.removeAllEnrollees);
})();