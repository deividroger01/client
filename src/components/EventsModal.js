import React, { useState, useEffect, useContext } from "react";
import GlobalContext from "../context/GlobalContext";
import backendconn from "../api/api";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export default function EventsModal() {
  const {
    showEventsModal,
    setShowEventsModal,
    setShowEditEventModal,
    setIsMsgEvent,
  } = useContext(GlobalContext);
  const [events, setEvents] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterMode, setFilterMode] = useState("day");

  // carregar eventos e nome do serviço
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await backendconn.get("/scheduling");
        const allEvents = response.data;

        const eventsWithServiceName = await Promise.all(
          allEvents.map(async (event) => {
            const serviceName = await fetchServiceName(event.serviceId);

            const eTime = dayjs(event.endTime).format("HH:mm");
            const sTime = dayjs(event.startTime).format("HH:mm");
            const eDate = dayjs(event.startTime)
              .locale("pt-br")
              .format("DD [de] MMMM [de] YYYY");

            return {
              ...event,
              serviceName: serviceName,
              eTime: eTime,
              sTime: sTime,
              eDate: eDate,
            };
          })
        );

        // filtrar os eventos com base na data selecionada e no modo de filtro
        let filteredEvents = [];
        if (filterMode === "day" && selectedDate) {
          filteredEvents = eventsWithServiceName.filter((event) =>
            dayjs(event.startTime).isSame(selectedDate, "day")
          );
        } else if (filterMode === "week") {
          let weekDate = dayjs();

          const currentWeek = weekDate.week();
          const startOfWeek = weekDate.startOf("week");
          const endOfWeek = weekDate.endOf("week");

          filteredEvents = eventsWithServiceName.filter((event) => {
            const eventWeek = dayjs(event.startTime).week();
            return (
              eventWeek === currentWeek &&
              dayjs(event.startTime).isBetween(
                startOfWeek,
                endOfWeek,
                "day",
                "[]"
              )
            );
          });
        } else if (filterMode === "all") {
          filteredEvents = eventsWithServiceName;
        } else if (filterMode === "next_week") {
          const nextWeek = dayjs().add(1, "week");
          const startOfWeek = nextWeek.startOf("week");
          const endOfWeek = nextWeek.endOf("week");

          filteredEvents = eventsWithServiceName.filter((event) =>
            dayjs(event.startTime).isBetween(
              startOfWeek,
              endOfWeek,
              "day",
              "[]"
            )
          );
        } else {
          filteredEvents = eventsWithServiceName;
        }

        setEvents(filteredEvents);
        setEventsLoaded(true);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchServiceName = async (serviceId) => {
      try {
        const response = await backendconn.get(`/service/${serviceId}`);
        const service = response.data;
        return service.name;
      } catch (error) {
        console.error(error);
        return null;
      }
    };

    if (showEventsModal) {
      fetchEvents();
    }
  }, [showEventsModal, selectedDate, filterMode]);

  // atualizar a data selecionada
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };
  // atualizar o modo de filtro
  const handleFilterModeChange = (mode) => {
    setFilterMode(mode);
  };

  // ordernar os agendamentos por data e horario de inicio
  events.sort((a, b) => {
    const dateA = a.startTime;
    const dateB = b.startTime;

    if (dateA < dateB) {
      return -1; // a < b
    } else if (dateA > dateB) {
      return 1; // a > b
    } else {
      const timeA = parseInt(a.sTime.replace(":", ""));
      const timeB = parseInt(b.sTime.replace(":", ""));

      return timeA - timeB;
    }
  });

  // abrir a tela de edição de agendamentos
  function handleEdit(id) {
    setShowEditEventModal(id);
    setShowEventsModal(false);
    return;
  }

  // cancelar agendamento
  async function handleDelete(scdId, evtId) {
    backendconn
      .delete("/event/" + evtId)
      .then(function(response) {
        // handle success
        backendconn
          .delete("/scheduling/" + scdId)
          .then(function(response) {
            // handle success
            console.log(response);
          })
          .catch(function(error) {
            // handle error
            console.log(error);
          });
        setIsMsgEvent([response.data]);
        setIsModalOpen();
      })
      .catch(function(error) {
        // handle error
        setIsMsgEvent([error.response.data]);
        setIsModalOpen(null);
        console.log(error);
      });
  }

  // fechar modal
  const setIsModalOpen = () => {
    setShowEventsModal(false);
    return;
  };

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showEventsModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-7xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center">
              Agendamentos
            </h3>
            <button
              className="print-hidden text-white hover:text-red-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
              onClick={setIsModalOpen}
            >
              <span className="material-icons-outlined cursor-pointer mx-2">
                close
              </span>
            </button>
          </div>
          <div className="px-4 py-3 overflow-x-auto">
            <div className="flex justify-center items-center sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              <label
                htmlFor="date-picker"
                className="block mr-2 text-sm font-medium text-gray-700 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Selecionar data:
              </label>
              <div>
                <DatePicker
                  id="date-picker"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="mt-1 focus:ring-greensas focus:border-greensas block w-full border-gray-300 rounded-md sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  placeholderText="DD/MM/YYYY"
                />
              </div>

              <div>
                <button
                  className={`print-hidden w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    filterMode === "day" ? "text-greensas" : "text-gray-700"
                  }`}
                  onClick={() => handleFilterModeChange("day")}
                >
                  Dia
                </button>
              </div>
              <label
                htmlFor="date-picker"
                className="block ml-4 mr-2 text-sm font-medium text-gray-700"
              >
                ou
              </label>
              <div>
                <button
                  className={`print-hidden w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    filterMode === "week" ? "text-greensas" : "text-gray-700"
                  }`}
                  onClick={() => handleFilterModeChange("week")}
                >
                  Semana Atual
                </button>
              </div>
              <label
                htmlFor="date-picker"
                className="block ml-4 mr-2 text-sm font-medium text-gray-700"
              >
                ou
              </label>
              <div>
                <button
                  className={`print-hidden w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    filterMode === "next_week"
                      ? "text-greensas"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleFilterModeChange("next_week")}
                >
                  Próxima Semana
                </button>
              </div>

              <label
                htmlFor="date-picker"
                className="block ml-4 mr-2 text-sm font-medium text-gray-700"
              >
                ou
              </label>
              <div>
                <button
                  className={`print-hidden w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                    filterMode === "all" ? "text-greensas" : "text-gray-700"
                  }`}
                  onClick={() => handleFilterModeChange("all")}
                >
                  Tudo
                </button>
              </div>
            </div>
            <div className="mt-4 sm:overflow-auto">
              <table
                className="min-w-full divide-y divide-gray-200"
                id="print-table"
              >
                <thead>
                  <tr className="bg-gray-50">
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Dia do agendamento
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Horário do agendamento
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Nome do Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Telefone do Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Email do Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Serviço
                    </th>
                    <th
                      scope="col"
                      className="print-hidden px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Editar
                    </th>
                    <th
                      scope="col"
                      className="print-hidden px-6 py-3 text-left text-xs font-medium text-greensas uppercase tracking-wider"
                    >
                      Excluir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventsLoaded ? (
                    events.length > 0 ? (
                      events.map((event) => (
                        <tr key={event._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {event.eDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {event.sTime} até {event.eTime}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {event.clientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {event.clientPhone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {event.clientEmail}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {event.serviceName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="print-hidden text-indigo-600 hover:text-indigo-900"
                              onClick={() => handleEdit(event._id)}
                            >
                              <span className="sr-only">Editar</span>
                              <span className="material-icons-outlined cursor-pointer text-red mx-2">
                                edit
                              </span>
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              className="print-hidden text-red-600 hover:text-red-900"
                              onClick={() =>
                                handleDelete(event._id, event.eventId)
                              }
                            >
                              <span className="sr-only">Excluir</span>
                              <span className="material-icons-outlined cursor-pointer text-red mx-2">
                                delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td>
                          <p className="text-gray-500 items-center">
                            Não há agendamentos.
                          </p>
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Carregando agendamentos...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <footer className="print-hidden bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg overflow-hidden">
              <button
                type="button"
                className="print-hidden mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-greensas hover:bg-greensas hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={setIsModalOpen}
              >
                Voltar
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
