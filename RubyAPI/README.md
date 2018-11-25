# README

* Ruby version : '2.3.7'
* Rails version : '~> 5.2.1'

## Gem Added
I have used to gem to develop this API :
gem 'elasticsearch'
gem 'rack-cors'

## How to use the api
* Clone the repo
* On your terminal execute : `bundle install`
* Then execute : `rails s`
* The api should be available on the port 3000

## Structure
This api has been build with the command `rails new myapp --api`.

In the /config/routes.rb I have added the route corresponding to the controller Articles

I have added the controller Article wich uses the elasticsearch gem in order to do the request to the elasticsearch cloud streem provides to me.

