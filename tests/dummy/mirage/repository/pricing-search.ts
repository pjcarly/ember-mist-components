export const BRUSVO1ADT = {
  data: [
    {
      id: null,
      type: "itinerary",
      attributes: {
        "external-id": null,
        visibility: "public",
        "fare-type": "full_service",
        "passport-mandatory": false,
        "amount-of-adults": 1,
        "amount-of-children": 0,
        "amount-of-infants": 0,
        "fare-codes": null,
        gds: "sabre",
        "ticket-immediately": false,
      },
      relationships: {
        routes: {
          data: [
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-09T07:45:00+01:00",
                "arrival-date": "2021-03-09T14:50:00+03:00",
                duration: 305,
                layover: 50,
                origin: "BRU",
                destination: "SVO",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35321,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T07:45:00+01:00",
                        "arrival-date": "2021-03-09T09:50:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "BRU",
                        "destination-airport": "WAW",
                        "operating-flight-number": 232,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 232,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "E95",
                        layover: 100,
                        duration: 125,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35410,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T10:40:00+01:00",
                        "arrival-date": "2021-03-09T14:50:00+03:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "SVO",
                        "operating-flight-number": 675,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 675,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 0,
                        duration: 130,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-16T15:40:00+03:00",
                "arrival-date": "2021-03-16T18:40:00+01:00",
                duration: 300,
                layover: 35,
                origin: "SVO",
                destination: "BRU",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35325,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T15:40:00+03:00",
                        "arrival-date": "2021-03-16T15:55:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "SVO",
                        "destination-airport": "WAW",
                        "operating-flight-number": 676,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 676,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 100,
                        duration: 135,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35413,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T16:30:00+01:00",
                        "arrival-date": "2021-03-16T18:40:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "BRU",
                        "operating-flight-number": 233,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 233,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "738",
                        layover: 0,
                        duration: 130,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        "price-quotes": {
          data: [
            {
              id: null,
              type: "price-quote",
              attributes: {
                "passenger-type": "ADT",
                "passenger-type-code": "ADT",
                "amount-of-passengers": 1,
                visibility: "public",
                fare: {
                  currency: "EUR",
                  "base-fare": 350,
                  "fuel-surcharge": 100,
                  "passenger-type": null,
                  "airport-tax": 77.75,
                },
                "validating-carrier": null,
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35321,
                      type: "flight",
                    },
                    {
                      id: 35410,
                      type: "flight",
                    },
                    {
                      id: 35325,
                      type: "flight",
                    },
                    {
                      id: 35413,
                      type: "flight",
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      id: null,
      type: "itinerary",
      attributes: {
        "external-id": null,
        visibility: "public",
        "fare-type": "full_service",
        "passport-mandatory": false,
        "amount-of-adults": 1,
        "amount-of-children": 0,
        "amount-of-infants": 0,
        "fare-codes": null,
        gds: "sabre",
        "ticket-immediately": false,
      },
      relationships: {
        routes: {
          data: [
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-09T07:45:00+01:00",
                "arrival-date": "2021-03-09T20:40:00+03:00",
                duration: 655,
                layover: 395,
                origin: "BRU",
                destination: "SVO",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35458,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T07:45:00+01:00",
                        "arrival-date": "2021-03-09T09:50:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "BRU",
                        "destination-airport": "WAW",
                        "operating-flight-number": 232,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 232,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "E95",
                        layover: 100,
                        duration: 125,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35445,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T16:25:00+01:00",
                        "arrival-date": "2021-03-09T20:40:00+03:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "SVO",
                        "operating-flight-number": 677,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 677,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 0,
                        duration: 135,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-16T15:40:00+03:00",
                "arrival-date": "2021-03-16T22:10:00+01:00",
                duration: 510,
                layover: 245,
                origin: "SVO",
                destination: "BRU",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35461,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T15:40:00+03:00",
                        "arrival-date": "2021-03-16T15:55:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "SVO",
                        "destination-airport": "WAW",
                        "operating-flight-number": 676,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 676,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 100,
                        duration: 135,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35464,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T20:00:00+01:00",
                        "arrival-date": "2021-03-16T22:10:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "BRU",
                        "operating-flight-number": 231,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 231,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "E95",
                        layover: 0,
                        duration: 130,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        "price-quotes": {
          data: [
            {
              id: null,
              type: "price-quote",
              attributes: {
                "passenger-type": "ADT",
                "passenger-type-code": "ADT",
                "amount-of-passengers": 1,
                visibility: "public",
                fare: {
                  currency: "EUR",
                  "base-fare": 350,
                  "fuel-surcharge": 100,
                  "airport-tax": 77.75,
                },
                "validating-carrier": null,
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35458,
                      type: "flight",
                    },
                    {
                      id: 35445,
                      type: "flight",
                    },
                    {
                      id: 35461,
                      type: "flight",
                    },
                    {
                      id: 35464,
                      type: "flight",
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    {
      id: null,
      type: "itinerary",
      attributes: {
        "external-id": null,
        visibility: "public",
        "fare-type": "full_service",
        "passport-mandatory": false,
        "amount-of-adults": 1,
        "amount-of-children": 0,
        "amount-of-infants": 0,
        "fare-codes": null,
        gds: "sabre",
        "ticket-immediately": false,
      },
      relationships: {
        routes: {
          data: [
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-09T07:45:00+01:00",
                "arrival-date": "2021-03-09T20:40:00+03:00",
                duration: 655,
                layover: 395,
                origin: "BRU",
                destination: "SVO",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35483,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T07:45:00+01:00",
                        "arrival-date": "2021-03-09T09:50:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "BRU",
                        "destination-airport": "WAW",
                        "operating-flight-number": 232,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 232,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "E95",
                        layover: 100,
                        duration: 125,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35470,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-09T16:25:00+01:00",
                        "arrival-date": "2021-03-09T20:40:00+03:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "SVO",
                        "operating-flight-number": 677,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 677,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 0,
                        duration: 135,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
            {
              id: null,
              type: "route",
              attributes: {
                "departure-date": "2021-03-16T15:40:00+03:00",
                "arrival-date": "2021-03-16T18:40:00+01:00",
                duration: 300,
                layover: 35,
                origin: "SVO",
                destination: "BRU",
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35486,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T15:40:00+03:00",
                        "arrival-date": "2021-03-16T15:55:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "SVO",
                        "destination-airport": "WAW",
                        "operating-flight-number": 676,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 676,
                        "amount-of-stops": 0,
                        "distance-in-km": 1154,
                        "equipment-type": "738",
                        layover: 100,
                        duration: 135,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/r3rf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                    {
                      id: 35489,
                      type: "flight",
                      attributes: {
                        "amount-of-seats-remaining": null,
                        "departure-date": "2021-03-16T16:30:00+01:00",
                        "arrival-date": "2021-03-16T18:40:00+01:00",
                        "cabin-class": "Business",
                        "departure-airport": "WAW",
                        "destination-airport": "BRU",
                        "operating-flight-number": 233,
                        "operating-airline": "LO",
                        "marketing-airline": "LO",
                        "marketing-flight-number": 233,
                        "amount-of-stops": 0,
                        "distance-in-km": 1149,
                        "equipment-type": "738",
                        layover: 0,
                        duration: 130,
                        digest:
                          "DKPWhHgSRv00AnZ6ibO2PSHT5Vxklm0y/mB485R2RTbO9s4WK63RrsE0wNkgIPp/qXrf",
                        baggage: {
                          ADT: {
                            pieces: 2,
                            weight: null,
                            type: "pieces",
                            description:
                              "UP TO 70 POUNDS/32 KILOGRAMS, UP TO 62 LINEAR INCHES/158 LINEAR CENTIMETERS",
                          },
                        },
                        meals: {
                          ADT: ["Meal"],
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        },
        "price-quotes": {
          data: [
            {
              id: null,
              type: "price-quote",
              attributes: {
                "passenger-type": "ADT",
                "passenger-type-code": "ADT",
                "amount-of-passengers": 1,
                visibility: "public",
                fare: {
                  currency: "EUR",
                  "base-fare": 350,
                  "fuel-surcharge": 100,
                  "passenger-type": null,
                  "airport-tax": 77.75,
                },
                "validating-carrier": null,
              },
              relationships: {
                segments: {
                  data: [
                    {
                      id: 35483,
                      type: "flight",
                    },
                    {
                      id: 35470,
                      type: "flight",
                    },
                    {
                      id: 35486,
                      type: "flight",
                    },
                    {
                      id: 35489,
                      type: "flight",
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    },
  ],
  included: [
    {
      id: "8500",
      type: "airline",
      attributes: {
        name: "Air Baltic",
        code: "BT",
        icao: "BTI",
        logo: null,
        logo70: "",
      },
    },
    {
      id: "635",
      type: "airport",
      attributes: {
        name: "Brussels Natl",
        city: "Brussels",
        "iata-faa": "BRU",
        icao: "EBBR",
      },
      relationships: {
        "city-ref": {
          data: {
            id: "8738",
            type: "city",
          },
        },
        country: {
          data: {
            id: "97",
            type: "country",
          },
        },
      },
    },
    {
      id: "4097",
      type: "airport",
      attributes: {
        name: "Riga Intl",
        city: "Riga",
        "iata-faa": "RIX",
        icao: "EVRA",
      },
      relationships: {
        country: {
          data: {
            id: "211",
            type: "country",
          },
        },
      },
    },
    {
      id: "3177",
      type: "airport",
      attributes: {
        name: "Sheremetyevo",
        city: "Moscow",
        "iata-faa": "SVO",
        icao: "UUEE",
      },
      relationships: {
        "city-ref": {
          data: {
            id: "8776",
            type: "city",
          },
        },
        country: {
          data: {
            id: "266",
            type: "country",
          },
        },
      },
    },
    {
      id: "8488",
      type: "airline",
      attributes: {
        name: "Finnair",
        code: "AY",
        icao: "FIN",
        logo: null,
        logo70: "",
      },
    },
    {
      id: "753",
      type: "airport",
      attributes: {
        name: "Helsinki Vantaa",
        city: "Helsinki",
        "iata-faa": "HEL",
        icao: "EFHK",
      },
      relationships: {
        country: {
          data: {
            id: "146",
            type: "country",
          },
        },
      },
    },
  ],
};
