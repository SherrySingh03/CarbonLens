import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Panel, Toggle, SegmentedPick, RangeSlider, Counter } from '../src/components/FormWidgets'

const OPTIONS = ['a', 'b', 'c'] as const

// ─── Panel ───────────────────────────────────────────────────────────────────

describe('Panel', () => {
  it('renders children', () => {
    render(<Panel><span>hello</span></Panel>)
    expect(screen.getByText('hello')).toBeTruthy()
  })
})

// ─── Toggle ──────────────────────────────────────────────────────────────────

describe('Toggle', () => {
  it('renders with role=switch and aria-checked=false', () => {
    render(<Toggle label="Test" description="desc" value={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('renders aria-checked=true when value is true', () => {
    render(<Toggle label="Test" description="desc" value={true} onChange={vi.fn()} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('has an accessible name matching the label', () => {
    render(<Toggle label="Electric car" description="desc" value={false} onChange={vi.fn()} />)
    expect(screen.getByRole('switch', { name: 'Electric car' })).toBeInTheDocument()
  })

  it('calls onChange with flipped value on click', () => {
    const onChange = vi.fn()
    render(<Toggle label="Test" description="desc" value={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

// ─── SegmentedPick ────────────────────────────────────────────────────────────

describe('SegmentedPick', () => {
  it('renders a radiogroup with the given label', () => {
    render(<SegmentedPick label="Choose" options={OPTIONS} value="a" onChange={vi.fn()} />)
    expect(screen.getByRole('radiogroup', { name: 'Choose' })).toBeInTheDocument()
  })

  it('renders all options as radio buttons', () => {
    render(<SegmentedPick label="Choose" options={OPTIONS} value="a" onChange={vi.fn()} />)
    expect(screen.getAllByRole('radio')).toHaveLength(3)
  })

  it('marks selected option aria-checked=true, others false', () => {
    render(<SegmentedPick label="Choose" options={OPTIONS} value="b" onChange={vi.fn()} />)
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onChange with the clicked option', () => {
    const onChange = vi.fn()
    render(<SegmentedPick label="Choose" options={OPTIONS} value="a" onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('radio')[2])
    expect(onChange).toHaveBeenCalledWith('c')
  })
})

// ─── RangeSlider ─────────────────────────────────────────────────────────────

describe('RangeSlider', () => {
  it('renders a range input', () => {
    render(<RangeSlider label="Km" value={50} max={200} unit="km" onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toBeTruthy()
  })

  it('calls onChange with the numeric value on input', () => {
    const onChange = vi.fn()
    render(<RangeSlider label="Km" value={50} max={200} unit="km" onChange={onChange} />)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '120' } })
    expect(onChange).toHaveBeenCalledWith(120)
  })

  it('associates label with input via htmlFor', () => {
    render(<RangeSlider label="Distance" value={50} max={200} unit="km" onChange={vi.fn()} />)
    const input = screen.getByRole('slider')
    const label = screen.getByText('Distance')
    expect(label).toHaveAttribute('for', input.id)
  })
})

// ─── Counter ─────────────────────────────────────────────────────────────────

describe('Counter', () => {
  it('renders Decrease and Increase buttons with aria-labels', () => {
    render(<Counter label="Flights" value={3} unit="hours" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Decrease Flights' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Increase Flights' })).toBeTruthy()
  })

  it('calls onChange with incremented value on + click', () => {
    const onChange = vi.fn()
    render(<Counter label="Flights" value={3} unit="hours" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase Flights' }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('calls onChange with decremented value on − click', () => {
    const onChange = vi.fn()
    render(<Counter label="Flights" value={3} unit="hours" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Flights' }))
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('clamps at min (default 0) — does not go below', () => {
    const onChange = vi.fn()
    render(<Counter label="Flights" value={0} unit="hours" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Decrease Flights' }))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('clamps at max (default 20) — does not go above', () => {
    const onChange = vi.fn()
    render(<Counter label="Flights" value={20} unit="hours" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase Flights' }))
    expect(onChange).toHaveBeenCalledWith(20)
  })

  it('respects custom max prop', () => {
    const onChange = vi.fn()
    render(<Counter label="Count" value={5} max={5} unit="items" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Increase Count' }))
    expect(onChange).toHaveBeenCalledWith(5)
  })
})
