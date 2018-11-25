#Readme
This is a react app to visualize the result of the requests to a ruby api.

## How to install the app 
* clone this repo
* open a terminal in the cloned directory
* execute `npm install`
* execute `npm start`
* the app is normaly running on the port 3001


## The Components
### App
The root component of the App, it renders the Form component
### Form
The component wich renders the BarChart component and a form to set the paramters of the requests to the API. 
### BarChart
The component wich uses axios to make the request to the API and renders a D3.js chart according to its props
## Dependencies
To implement this app I have used :
* D3.js
* Axios
* Material UI
