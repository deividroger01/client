import React, { useRef, useState, useEffect, useContext } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekOfYear from "dayjs/plugin/weekOfYear";

import backendconn from "../api/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

dayjs.extend(weekOfYear);
dayjs.extend(isBetween);

export default function ReportModal() {
  const contentRef = useRef(null);

  const { showReportModal, setShowReportModal } = useContext(GlobalContext);
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

    if (showReportModal) {
      fetchEvents();
    }
  }, [showReportModal, selectedDate, filterMode]);

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

  const handlePrint = () => {
    const tableElement = contentRef.current;
    if (!tableElement) {
      return;
    }

    // criar uma cópia para impressão
    const printContents = tableElement.cloneNode(true);
    printContents.removeAttribute("ref");

    const printWindow = window.open("", "_blank");

    const styles = Array.from(
      document.querySelectorAll("link[rel='stylesheet'], style")
    )
      .map((element) => element.outerHTML)
      .join("");

    printWindow.document.open();
    printWindow.document.write(`
    <html>
      <head>
        <title>Relatório de Agendamentos</title>
        ${styles}
      </head>
      <body>
        ${printContents.outerHTML}
        <script type="text/javascript">
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            }
          }
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
  };

  const setIsModalOpen = () => {
    setShowReportModal(false);
    return;
  };

  // renderizar os eventos filtrados
  const renderEvents = () => {
    if (!eventsLoaded) {
      return (
        <tr>
          <td colSpan="6">Carregando relatório...</td>
        </tr>
      );
    }

    if (events.length === 0) {
      return (
        <tr>
          <td colSpan="6">Não há agendamentos.</td>
        </tr>
      );
    }

    return events.map((event) => (
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
      </tr>
    ));
  };

  return (
    <div
      className={`fixed z-50 top-0 left-0 w-full h-full overflow-auto bg-greensas bg-opacity-40 ${
        showReportModal ? "block" : "hidden"
      }`}
    >
      <div className="relative w-full max-w-7xl mx-auto mt-10">
        <div className="bg-white shadow-lg rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 bg-greensas rounded-t-lg">
            <h3 className="text-lg font-medium text-white text-center">
              Relatório de Agendamentos
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
            <div className="flex justify-center items-center">
              <label
                htmlFor="date-picker"
                className="block mr-2 text-sm font-medium text-gray-700"
              >
                Selecionar data:
              </label>
              <div>
                <DatePicker
                  id="date-picker"
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="dd/MM/yyyy"
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                ref={contentRef}
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {renderEvents()}
                </tbody>
              </table>
            </div>
            <footer className="print-hidden bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg overflow-hidden">
              <button
                onClick={handlePrint}
                className="print-hidden w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-greensas text-base font-medium text-white hover:bg-white hover:text-greensas hover:border-greensas focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-greensas sm:ml-3 sm:w-auto sm:text-sm"
              >
                Imprimir
              </button>

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
