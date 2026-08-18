import api from './api';

export const getStations = async () => {
    const res = await api.get('/stations');
    return res.data;
};

export const getTrains = async () => {
    const res = await api.get('/trains');
    return res.data;
};

export const searchSchedules = async (departureStation, arrivalStation, departureDate) => {
    const res = await api.get('/schedules', {
        params: { departureStation, arrivalStation, departureDate }
    });
    return res.data;
};

export const getScheduleDetails = async (id) => {
    const res = await api.get(`/schedules/${id}`);
    return res.data;
};
