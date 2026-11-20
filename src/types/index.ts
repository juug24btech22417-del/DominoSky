export interface Airport {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
  tier: 'mega_hub' | 'regional_hub' | 'spoke';
  capacity_per_hour: number;
}

export interface Flight {
  flight_id: string;
  tail_id: string;
  leg_order: number;
  origin: string;
  destination: string;
  dep: string; // "HH:MM"
  arr: string; // "HH:MM"
  block_minutes: number;
  pax: number;
  turnaround_before_min: number | null;
}

export interface Connection {
  connection_id: string;
  airport: string;
  from_flight: string;
  to_flight: string;
  passengers: number;
  min_connect_minutes: number;
}

export interface Crew {
  crew_id: string;
  tail_id: string;
  base: string;
  duty_start: string;
  max_duty_mins: number;
  flight_ids: string[];
}

export interface SpareAircraft {
  tail_id: string;
  base: string;
  available_from: string;
  seats: number;
}

export interface Dataset {
  meta: {
    dataset: string;
    operating_day: string;
    min_turnaround_minutes: number;
    seats_per_aircraft: number;
    notes: string[];
  };
  airports: Airport[];
  flights: Flight[];
  connections: Connection[];
  crews: Crew[];
  spare_aircraft: SpareAircraft[];
}

export interface CausalStep {
  step: number;
  type: 'closure' | 'turnaround' | 'tail_propagation' | 'crew_duty' | 'pax_connection' | 'spare_swap';
  description: string;
  impact_minutes?: number;
  flight_id?: string;
  airport?: string;
}

export interface FlightSimResult {
  flight_id: string;
  tail_id: string;
  active_tail_id: string; // Might be spare
  leg_order: number;
  origin: string;
  destination: string;
  sched_dep_min: number;
  sched_arr_min: number;
  sched_dep: string;
  sched_arr: string;
  actual_dep_min: number;
  actual_arr_min: number;
  actual_dep: string;
  actual_arr: string;
  dep_delay: number;
  arr_delay: number;
  is_delayed: boolean;
  is_cancelled: boolean;
  cancel_reason?: string;
  pax: number;
  causal_chain: CausalStep[];
  primary_root_cause: string;
}

export interface ConnectionSimResult {
  connection_id: string;
  airport: string;
  from_flight: string;
  to_flight: string;
  passengers: number;
  min_connect_minutes: number;
  inbound_arr_min: number;
  outbound_dep_min: number;
  actual_slack_min: number;
  is_broken: boolean;
}

export interface CrewSimResult {
  crew_id: string;
  tail_id: string;
  base: string;
  duty_start_min: number;
  max_duty_mins: number;
  duty_end_min: number;
  total_duty_mins: number;
  is_violation: boolean;
  excess_mins: number;
  last_flight_id: string;
}

export interface DisruptionEvent {
  time_min: number;
  time_str: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  details: string;
  flight_id?: string;
  airport?: string;
}

export interface SimulationOutput {
  closure: {
    airport: string | null;
    start_min: number;
    end_min: number;
    duration: number;
  } | null;
  total_flights: number;
  on_time_flights: number;
  delayed_flights_count: number;
  cancelled_flights_count: number;
  total_delay_minutes: number;
  stranded_passengers: number;
  crew_violations_count: number;
  disruption_cost_inr: number;
  cost_breakdown: {
    pax_compensation_inr: number;
    crew_overtime_inr: number;
    fuel_and_ops_inr: number;
  };
  network_health_score: number;
  flights: Record<string, FlightSimResult>;
  connections: Record<string, ConnectionSimResult>;
  crews: Record<string, CrewSimResult>;
  events: DisruptionEvent[];
  critical_flight_id: string | null;
}

export interface RecoveryAction {
  id: string;
  type: 'spare_swap' | 'strategic_cancel' | 'retime_buffer';
  title: string;
  tagline: string;
  description: string;
  target_flight_id: string;
  target_airport: string;
  resource_used: string;
  metrics_delta: {
    delay_minutes_saved: number;
    passengers_rescued: number;
    cost_saved_inr: number;
    crew_violations_prevented: number;
  };
  before_summary: {
    delay_minutes: number;
    stranded_pax: number;
    cost_inr: number;
    crew_violations: number;
  };
  after_summary: {
    delay_minutes: number;
    stranded_pax: number;
    cost_inr: number;
    crew_violations: number;
  };
  strategy_tag: 'Cost Minimizer' | 'Passenger First' | 'Schedule Integrity';
}

