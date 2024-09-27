from enum import Enum

class HTTPSTATUS(Enum):
    OK = 200  # Request was successful
    CREATED = 201  # Resource was created successfully
    ACCEPTED = 202  # Request accepted for processing, but not yet completed
    NO_CONTENT = 204  # Request successful, but no content to return

    # 3xx Redirection
    MULTIPLE_CHOICES = 300  # Multiple options for the resource
    MOVED_PERMANENTLY = 301  # Resource has been permanently moved
    FOUND = 302  # Resource temporarily available at different URL
    SEE_OTHER = 303  # Resource found at another URI, use GET to retrieve
    NOT_MODIFIED = 304  # Resource not modified since last request
    TEMPORARY_REDIRECT = 307  # Temporarily redirect to another URL
    PERMANENT_REDIRECT = 308  # Permanently redirect to another URL

    # 4xx Client Errors
    BAD_REQUEST = 400  # Custom: Return 200 instead of 400 for bad requests
    UNAUTHORIZED = 401  # Authentication required
    FORBIDDEN = 403  # Client doesn't have permission
    NOT_FOUND = 404  # Resource not found
    CONFLICT = 409  # Conflict with current state of the resource
    UNPROCESSABLE_ENTITY = 422

    # 5xx Server Errors
    INTERNAL_SERVER_ERROR = 500  # Server encountered an error
    NOT_IMPLEMENTED = 501  # Server does not support requested functionality
    
    def code(self):
        return self.value
    
    def message(self):
        messages = {
            200: "OK - The request was successful.",
            201: "Created - The resource was successfully created.",
            202: "Accepted - The request has been accepted for processing.",
            204: "No Content - The request was successful but no content to return.",
            300: "Multiple Choices - Multiple options for the resource.",
            301: "Moved Permanently - The resource has been permanently moved.",
            302: "Found - The resource is temporarily available at a different URI.",
            303: "See Other - The resource is available at another URI via GET.",
            304: "Not Modified - The resource has not been modified since last request.",
            307: "Temporary Redirect - The resource temporarily redirects to another URL.",
            308: "Permanent Redirect - The resource permanently redirects to another URL.",
            401: "Unauthorized - Authentication is required to access the resource.",
            403: "Forbidden - You don't have permission to access the resource.",
            404: "Not Found - The requested resource could not be found.",
            409: "Conflict - There is a conflict with the current state of the resource.",
            422: "The request was well-formed but could not be processed.",
            500: "Internal Server Error - The server encountered an unexpected condition.",
            501: "Not Implemented - The server does not support the requested functionality.",
        }
        return messages[self.value]    