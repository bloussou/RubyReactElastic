require 'elasticsearch'
module Api
    module V1
        class ArticlesController < ApplicationController
            def index
                client = Elasticsearch::Client.new url: '__URL_TO_SET__'
                response = client.search index: 'events', body: {
                    "query": {
                      "bool": {
                        "must": [
                          {
                            "range": {
                              "derived_tstamp": {
                                "gte": params[:before],
                                "lt": params[:after],
                                "format": "yyyy-MM-dd HH:mm:ss"
                              }
                            }
                          },
                          {
                            "terms": {
                              "page_url": params[:urls]
                            }
                          }
                        ]
                      }
                    },
                    "aggs": {
                      "first_agg": {
                        "date_histogram": {
                          "field": "derived_tstamp",
                          "interval": params[:interval]
                        },
                        "aggs": {
                          "counts": {
                            "terms": {
                              "field": "page_url"
                            }
                          }
                        }
                      }
                    }
                  }
                render json: {status: 'SUCCESS', message:'Loaded articles', data:response}, status: :ok
            end
        end
    end
end