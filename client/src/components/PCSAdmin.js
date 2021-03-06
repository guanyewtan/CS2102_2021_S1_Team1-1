import React, { Fragment, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import ChartistGraph from 'react-chartist'
import Chartist from 'chartist';
import MyLegend from 'chartist-plugin-legend';
import PCSTable from "./PCSTable"
import { toast } from "react-toastify";
import ViewReviews from "./ViewReviews";
import PCSCommission from "./PCSCommission";


const PCSAdmin = () => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [yearOptions, setYearOptions] = useState([])
  const [yearDisplayed, setYearDisplayed] = useState('')
  const [underPerformingCaretakers, setunderPerformingCaretakers] = useState([])
  const [pieState, setPieState] = useState({
    monthDisplayed: '',
    data: {
      labels: ["Full-Time", "Part-Time"],
      series: []
    },
    options: {
      chartPadding: 15,
      labelOffset: 50,
      labelDirection: 'explode',
    }
  })

  const [lineState, setLineState] = useState({
    data: {
      labels: monthNames,
      series: []
    },
    options: {
      plugins: [
        Chartist.plugins.legend({
          legendNames: ['Full-Time', 'Part-Time', 'Total']
        })
      ]
    }
  })

  const [lineChart2, setLineChart2] = useState({
    data: {
      labels: monthNames,
      series: []
    },
    options: {
      plugins: [
        Chartist.plugins.legend({
          legendNames: ['Accepted', 'Rejected', 'Pending']
        })
      ]
    }
  })

  const [managed, setManagedCaretakers] = useState([])
  const [managedFilter, setManagedCaretakersFilter] = useState('All')
  const [baseprice, setBasePrice] = useState();

  const onChange = (e) => {
    setBasePrice(e.target.value)
  }

  const getManagedCareTakers = async () => {
    try {
      const res = await fetch("/admin/caretakers?" + new URLSearchParams({
        employment_type: managedFilter
      }), {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const jsonData = await res.json();
      setManagedCaretakers(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };

  const changeBasePrice = async (e) => {
    try {
      console.log(baseprice)
      if (baseprice === undefined) {
        toast.error("Please enter in a valid base price!")
      } else {
        const body = { baseprice };
        const response = await fetch("/admin/changeprice", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            token: localStorage.token
          },
          body: JSON.stringify(body)
        });

        const submittedData = await response.json();

        window.location.reload();
        toast.success("You have changed the base price to $" + submittedData.base_price);
      }
    } catch (err) {
      console.error(err.message);
    }
  }

  // get number of full-time & part-time jobs for each month of the year
  const getLineData = async () => {
    if (yearDisplayed != '') {
      try {
        console.log("enter getLineData")
        console.log(`year = ${yearDisplayed}`)
        const year = yearDisplayed.toString()
        const response = await fetch('/pcsline?' + new URLSearchParams({
          year: year
        }), {
          method: "GET"
        });
        const data = await response.json()
        let numFulltime = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let numParttime = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let numTotal = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        data.map(datum => {
          let month = datum.startyearmonth.substring(5)
          if (month.includes('-')) {
            month = month.substring(0, 1)
          }
          if (datum.employment_type === 'fulltime') {
            numFulltime[parseInt(month) - 1] = parseInt(datum.count)
          } else if (datum.employment_type === 'parttime') {
            numParttime[parseInt(month) - 1] = parseInt(datum.count)
          }
        })
        for (let i = 0; i < numTotal.length; i++) {
          numTotal[i] = numFulltime[i] + numParttime[i]
        }
        setLineState(prevState => {
          return {
            ...prevState,
            data: {
              labels: monthNames,
              series: [
                numFulltime,
                numParttime,
                numTotal
              ]
            }
          };
        });

      } catch (err) {
        console.error(err.message)
      }
    }
  }

  const getLineChart2Data = async () => {
    if (yearDisplayed != '') {
      try {
        const year = yearDisplayed.toString()
        const response = await fetch('/pcsline2?' + new URLSearchParams({
          year: year
        }), {
          method: "GET"
        });
        const data = await response.json()
        let numAccepted = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let numRejected = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        let numPending = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        data.map(datum => {
          let month = datum.startyearmonth.substring(5)
          if (month.includes('-')) {
            month = month.substring(0, 1)
          }
          if (datum.status === 'accepted') {
            numAccepted[parseInt(month) - 1] += parseInt(datum.count)
          } else if (datum.status === 'rejected') {
            numRejected[parseInt(month) - 1] += parseInt(datum.count)
          } else if (datum.status === 'pending') {
            numPending[parseInt(month) - 1] += parseInt(datum.count)
          }
        })
        setLineChart2(prevState => {
          return {
            ...prevState,
            data: {
              labels: monthNames,
              series: [
                numAccepted,
                numRejected,
                numPending
              ]
            }
          };
        });

      } catch (err) {
        console.error(err.message)
      }
    }
  }

  const getCurrMonthYear = () => {
    var d = new Date();
    var years = new Array(10);
    for (var i = 0; i < 10; i++) {
      years[i] = d.getFullYear() - i
    }
    setYearDisplayed(d.getFullYear().toString())
    setPieState(prevState => {
      return {
        ...prevState,
        monthDisplayed: d.getMonth().toString(),
      };
    });
    setYearOptions(years)
  }

  const setMonthDisplayed = e => {
    const monthIndex = e.target.value
    setPieState(prevState => {
      return {
        ...prevState,
        monthDisplayed: monthIndex
      }
    })
  }

  const getCurrentDate = () => {
    var dt = new Date();
    return dt.getDate() + " " + (monthNames[dt.getMonth()]) + " " + dt.getFullYear();
  }

  const getPieData = async () => {
    if (pieState.monthDisplayed != '') {
      try {
        const duration = yearDisplayed + "-" + (parseInt(pieState.monthDisplayed) + 1).toString()
        const response = await fetch('/pcspie?' + new URLSearchParams({
          duration: duration
        }), {
          method: "GET"
        });
        const data = await response.json()
        setPieState(prevState => {
          return {
            ...prevState,
            data: {
              labels: ["Full-Time", "Part-Time"],
              series: [data[0].count, data[1].count]
            }
          };
        });
      } catch (err) {
        console.error(err.message)
      }
    }
  }

  const getunderPerformingCaretakers = async () => {
    try {
      const response = await fetch('/underperformingcaretakers', {
        method: "GET"
      });
      const data = await response.json()
      console.log(data)
      // received data format: 
      // caretaker , num_pet_days , avg_rating , num_rating_5 , num_rating_4 , num_rating_3 , num_rating_2 , num_rating_1 , num_rating_0 
      let arr = [];
      data.map(datum => {
        const attributes = datum.get_underperforming_caretakers.slice(1, -1)
        console.log(attributes)
        arr.push(attributes)


      })
      setunderPerformingCaretakers(arr)
    } catch (err) {
      console.error(err.message)
    }
  }


  useEffect(() => {
    getCurrMonthYear()
    getunderPerformingCaretakers()
  }, [])

  useEffect(() => {
    getManagedCareTakers()
  }, [managedFilter])

  useEffect(() => {
    getLineData()
    getPieData()
    getLineChart2Data()
  }, [yearDisplayed])

  useEffect(() => {
    getPieData()
  }, [pieState.monthDisplayed])

  return (
    <Fragment>
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-md-12 ml-sm-auto col-lg-12 px-md-4">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
              <h1 className="h2">Dashboard</h1>
              <div className="btn-toolbar mb-2 mb-md-0">
                <div className="btn-group mr-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary">Share</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary">Export</button>
                </div>
                <button type="button" className="btn btn-sm btn-outline-secondary dropdown-toggle">
                  <span data-feather="calendar"></span>
                  This week
                </button>
              </div>
            </div>
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="yearDisplayed">Year</label>
              </div>
              <select className="form-control" value={yearDisplayed} onChange={e => setYearDisplayed(e.target.value)} >
                {
                  yearOptions.map((year, index) => (
                    <option key={index} value={year}>{year}</option>
                  ))
                }
              </select>
            </div>

            <div className="row">
              <PCSCommission />
            </div>


            <div className="row">
              <div className="col-md-4">
                <div className="card ">
                  <div className="card-header ">
                    <h4 className="card-title">No. of pets taken care of</h4>
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <label className="input-group-text" htmlFor="monthDisplayed">Month</label>
                      </div>
                      <select
                        className="form-control"
                        value={pieState.monthDisplayed}
                        onChange={setMonthDisplayed}
                      >
                        {
                          monthNames.map((month, index) => (
                            <option key={index} value={index}>{month}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="card-body ">
                    <ChartistGraph data={pieState.data} type="Pie" options={pieState.options} />
                    <div className="legend">
                      <p>Total number of Accepted Jobs: {parseInt(pieState.data.series[0]) + parseInt(pieState.data.series[1])}</p>
                      <p>Number of Full-timer Jobs: {pieState.data.series[0]}</p>
                      <p>Number of Part-timer Jobs: {pieState.data.series[1]}</p>
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-clock-o"></i> Today's date: {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Total Number of Accepted Jobs</h4>
                    <p className="card-category">Year: {yearDisplayed}</p>
                  </div>
                  <div className="card-body ">
                    <ChartistGraph data={lineState.data} type="Line" options={lineState.options} />
                  </div>
                  <div className="card-footer ">
                    <div className="legend">
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i> Updated {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Number of jobs accepted, rejected or pending</h4>
                    <p className="card-category">Year: {yearDisplayed}</p>
                  </div>
                  <div className="card-body ">
                    <ChartistGraph data={lineChart2.data} type="Line" options={lineChart2.options} />
                  </div>
                  <div className="card-footer ">
                    <div className="legend">
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i> Updated {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">

            </div>


            <div className="row">

              <div className="col-md-6">
                <div className="card ">
                  <div className="card-header ">
                    <h4 className="card-title">Caretakers under management</h4>

                    <div className="input-group mb-3">
                      <input type="text"
                        pattern="[0-9]*"
                        name="baseprice"
                        placeholder="Enter base price here to change"
                        className="form-control"
                        value={baseprice}
                        onChange={e => onChange(e)} />
                      <div className="input-group-append">
                        <button className="btn btn-warning" type="button" onClick={e => changeBasePrice(e)}>Change</button>
                      </div>
                    </div>
                    <div className="input-group mb-3">
                      <div className="input-group-prepend">
                        <label className="input-group-text" htmlFor="managedDisplayed">Employment Type</label>
                      </div>
                      <select
                        className="form-control"
                        value={managedFilter}
                        onChange={e => setManagedCaretakersFilter(e.target.value)}
                      >
                        <option key="1" value="All">All</option>
                        <option key="2" value="fulltime">Full-Timers</option>
                        <option key="3" value="parttime">Part-Timers</option>
                      </select>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="overflow-auto" Style="max-height: 400px;" >
                      {managed.map((caretaker, i) => (
                        <div key={i} className="card mb-3">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-10">
                                <h5>Name: {caretaker.full_name}</h5>
                                <p>Rating: {caretaker.avg_rating.slice(0, 3)}</p>
                                {caretaker.employment_type === 'fulltime' && <p>Base price/day: ${caretaker.base_price}</p>}
                              </div>
                              <div className="col-2">
                                <ViewReviews search={caretaker} i={i} />
                              </div>
                            </div>
                          </div>
                        </div>)
                      )}
                    </div>
                  </div>
                  <div className="card-footer ">
                    <div className="legend">
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i> Updated {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card">
                  <div className="card-header ">
                    <h4 className="card-title">Underperforming Full-time caretakers</h4>
                  </div>
                  <div className="card-body ">
                    <div className="overflow-auto" Style="max-height: 457px;">
                      {
                        underPerformingCaretakers.map((attributes, i) => (

                          <div key={i} className="card border-danger">
                            <div className="card-header ">
                              <h5>Caretaker: {attributes.split(',')[0]}</h5>
                            </div>
                            <div className="card-body ">
                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of Pet Days worked:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[1]}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Average Rating:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{parseFloat(attributes.split(',')[2]).toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 5 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[3]}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 4 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[4]}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 3 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[5]}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 2 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[6]}</p>
                                </div>
                              </div>
                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 1 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[7]}</p>
                                </div>
                              </div>

                              <div className="row card-text">
                                <div className="col-md-6">
                                  <label>Number of rating 0 given:</label>
                                </div>
                                <div className="col-md-6">
                                  <p>{attributes.split(',')[8]}</p>
                                </div>
                              </div>

                            </div>
                          </div>

                        ))
                      }
                    </div>
                  </div>
                  <div className="card-footer ">
                    <div className="legend">
                    </div>
                    <hr />
                    <div className="stats">
                      <i className="fa fa-history"></i> Updated {getCurrentDate()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <PCSTable />
          </main>
        </div>
      </div>
    </Fragment>
  )
}

export default PCSAdmin